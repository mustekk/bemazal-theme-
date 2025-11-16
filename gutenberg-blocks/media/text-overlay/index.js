/* eslint-disable no-undef */
(function (wp) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    __experimentalLinkControl: LinkControl
  } = be;
  const {
    Button,
    PanelBody,
    RangeControl,
    TextControl,
    SelectControl,
    ColorPicker,
    Popover,
    ButtonGroup
  } = wp.components;

  registerBlockType('bemazal/text-overlay', {
    edit: function (props) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [showLinkPicker, setShowLinkPicker] = useState(false);

      const blockProps = useBlockProps({
        className: 'text-overlay-editor'
      });

      // Вычисляем margin-top на основе вертикального выравнивания
      const getMarginTop = () => {
        if (a.overlayVerticalAlign === 'top') return '50px';
        if (a.overlayVerticalAlign === 'bottom') return '-250px';
        return '-150px'; // center
      };

      // Вычисляем margin-left/right на основе позиции
      const getHorizontalMargin = () => {
        if (a.overlayPosition === 'left') return { marginLeft: '5%', marginRight: 'auto' };
        if (a.overlayPosition === 'center') return { marginLeft: 'auto', marginRight: 'auto' };
        return { marginLeft: 'auto', marginRight: '5%' }; // right
      };

      const overlayStyles = {
        backgroundColor: a.overlayBackgroundColor || '#ffffff',
        color: a.overlayTextColor || '#000000',
        padding: (a.overlayPadding || 40) + 'px',
        textAlign: a.textAlign || 'right',
        width: (a.overlayWidth || 45) + '%',
        maxWidth: '600px',
        position: 'relative',
        marginTop: getMarginTop(),
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        ...getHorizontalMargin()
      };

      const inspector = el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: 'Изображение', initialOpen: true },
          el('h4', { style: { marginBottom: '10px' } }, 'Desktop изображение'),
          el(
            MediaUploadCheck,
            null,
            el(MediaUpload, {
              onSelect: (m) => set({ desktopImage: m.url || '', imageAlt: m.alt || '' }),
              allowedTypes: ['image'],
              value: a.desktopImage,
              render: ({ open }) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  a.desktopImage ? 'Изменить изображение' : 'Выбрать изображение'
                )
            })
          ),
          a.desktopImage && el('img', {
            src: a.desktopImage,
            style: { maxWidth: '100%', marginTop: '10px', display: 'block' }
          }),
          el('h4', { style: { marginTop: '20px', marginBottom: '10px' } }, 'Mobile изображение'),
          el(
            MediaUploadCheck,
            null,
            el(MediaUpload, {
              onSelect: (m) => set({ mobileImage: m.url || '' }),
              allowedTypes: ['image'],
              value: a.mobileImage,
              render: ({ open }) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  a.mobileImage ? 'Изменить изображение' : 'Выбрать изображение'
                )
            })
          ),
          a.mobileImage && el('img', {
            src: a.mobileImage,
            style: { maxWidth: '100%', marginTop: '10px', display: 'block' }
          }),
          !a.mobileImage && el('p', {
            style: { fontSize: '12px', fontStyle: 'italic', color: '#666', marginTop: '10px' }
          }, 'Опционально: если не выбрано, будет использоваться Desktop изображение'),
          el(RangeControl, {
            label: 'Затемнение изображения',
            min: 0,
            max: 0.8,
            step: 0.05,
            value: a.imageOverlayOpacity || 0,
            onChange: (v) => set({ imageOverlayOpacity: parseFloat(v) })
          })
        ),
        el(
          PanelBody,
          { title: 'Позиционирование контейнера', initialOpen: true },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Позиция контейнера'),
            el(
              ButtonGroup,
              null,
              el(
                Button,
                {
                  variant: a.overlayPosition === 'left' ? 'primary' : 'secondary',
                  onClick: () => set({ overlayPosition: 'left', textAlign: 'left' })
                },
                'Слева'
              ),
              el(
                Button,
                {
                  variant: a.overlayPosition === 'center' ? 'primary' : 'secondary',
                  onClick: () => set({ overlayPosition: 'center', textAlign: 'center' })
                },
                'Центр'
              ),
              el(
                Button,
                {
                  variant: a.overlayPosition === 'right' ? 'primary' : 'secondary',
                  onClick: () => set({ overlayPosition: 'right', textAlign: 'right' })
                },
                'Справа'
              )
            )
          ),
          el(SelectControl, {
            label: 'Вертикальное выравнивание',
            value: a.overlayVerticalAlign || 'center',
            options: [
              { label: 'Сверху', value: 'top' },
              { label: 'По центру', value: 'center' },
              { label: 'Снизу', value: 'bottom' }
            ],
            onChange: (v) => set({ overlayVerticalAlign: v })
          }),
          el(RangeControl, {
            label: 'Ширина контейнера (%)',
            min: 20,
            max: 80,
            step: 5,
            value: a.overlayWidth || 45,
            onChange: (v) => set({ overlayWidth: parseInt(v, 10) })
          })
        ),
        el(
          PanelBody,
          { title: 'Стили контейнера', initialOpen: false },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет фона'),
            el(ColorPicker, {
              color: a.overlayBackgroundColor || '#ffffff',
              onChangeComplete: (color) => set({ overlayBackgroundColor: color.hex })
            })
          ),
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет текста'),
            el(ColorPicker, {
              color: a.overlayTextColor || '#000000',
              onChangeComplete: (color) => set({ overlayTextColor: color.hex })
            })
          ),
          el(RangeControl, {
            label: 'Отступы (px)',
            min: 20,
            max: 80,
            step: 5,
            value: a.overlayPadding || 40,
            onChange: (v) => set({ overlayPadding: parseInt(v, 10) })
          }),
          el(SelectControl, {
            label: 'Выравнивание текста',
            value: a.textAlign || 'right',
            options: [
              { label: 'Слева', value: 'left' },
              { label: 'По центру', value: 'center' },
              { label: 'Справа', value: 'right' }
            ],
            onChange: (v) => set({ textAlign: v })
          })
        ),
        el(
          PanelBody,
          { title: 'Размеры блока', initialOpen: false },
          el(RangeControl, {
            label: 'Минимальная высота (px)',
            min: 300,
            max: 900,
            step: 50,
            value: a.minHeight || 500,
            onChange: (v) => set({ minHeight: parseInt(v, 10) })
          })
        ),
        el(
          PanelBody,
          { title: 'Стиль кнопки', initialOpen: false },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Стиль кнопки'),
            el(
              ButtonGroup,
              null,
              el(
                Button,
                {
                  variant: a.buttonStyle === 'outline' ? 'primary' : 'secondary',
                  onClick: () => set({ buttonStyle: 'outline' })
                },
                'Контур'
              ),
              el(
                Button,
                {
                  variant: a.buttonStyle === 'filled' ? 'primary' : 'secondary',
                  onClick: () => set({ buttonStyle: 'filled' })
                },
                'Заливка'
              )
            )
          )
        )
      );

      return el(
        Fragment,
        null,
        inspector,
        el(
          'div',
          blockProps,
          a.desktopImage ? el(
            'div',
            { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
            el(
              'div',
              {
                style: {
                  position: 'relative',
                  width: '100%',
                  minHeight: (a.minHeight || 500) + 'px',
                  overflow: 'hidden'
                }
              },
              el('img', {
                src: a.desktopImage,
                alt: a.imageAlt || '',
                style: {
                  width: '100%',
                  height: '100%',
                  minHeight: 'inherit',
                  objectFit: 'cover',
                  display: 'block'
                }
              }),
              a.imageOverlayOpacity > 0 && el('div', {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, ' + (a.imageOverlayOpacity || 0) + ')',
                  pointerEvents: 'none',
                  zIndex: 1
                }
              })
            ),
            el(
              'div',
              { style: overlayStyles },
              el(RichText, {
                tagName: 'h2',
                value: a.heading,
                onChange: (v) => set({ heading: v }),
                placeholder: 'Введите заголовок...',
                style: {
                  margin: '0 0 15px 0',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }
              }),
              el(RichText, {
                tagName: 'p',
                value: a.text,
                onChange: (v) => set({ text: v }),
                placeholder: 'Введите текст описания...',
                style: {
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }
              }),
              el(
                'div',
                { style: { marginBottom: '16px' } },
                el(TextControl, {
                  label: 'Текст кнопки',
                  value: a.buttonText || '',
                  onChange: (v) => set({ buttonText: v }),
                  placeholder: 'Текст кнопки'
                })
              ),
              el(
                'div',
                { style: { marginBottom: '16px', position: 'relative' } },
                el('label', {
                  style: {
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    fontSize: '11px',
                    lineHeight: '1.4',
                    textTransform: 'uppercase'
                  }
                }, 'Ссылка кнопки'),
                el(
                  'div',
                  { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                  el(TextControl, {
                    value: a.buttonUrl || '',
                    onChange: (v) => set({ buttonUrl: v }),
                    placeholder: 'https://example.com',
                    style: { flex: '1' }
                  }),
                  el(
                    Button,
                    {
                      icon: 'admin-links',
                      variant: 'secondary',
                      onClick: () => setShowLinkPicker(!showLinkPicker),
                      label: 'Выбрать страницу'
                    }
                  )
                ),
                showLinkPicker && LinkControl && el(
                  Popover,
                  {
                    position: 'bottom center',
                    onClose: () => setShowLinkPicker(false)
                  },
                  el(LinkControl, {
                    value: a.buttonUrl ? { url: a.buttonUrl, opensInNewTab: a.buttonTarget === '_blank' } : {},
                    onChange: (link) => {
                      set({
                        buttonUrl: link.url || '',
                        buttonTarget: link.opensInNewTab ? '_blank' : '_self'
                      });
                      setShowLinkPicker(false);
                    },
                    showSuggestions: true
                  })
                )
              ),
              a.buttonText && el(
                'div',
                {
                  className: 'text-overlay-button-preview',
                  style: {
                    display: 'inline-block',
                    padding: '12px 30px',
                    border: a.buttonStyle === 'outline' ? '2px solid ' + a.overlayTextColor : 'none',
                    backgroundColor: a.buttonStyle === 'filled' ? a.overlayTextColor : 'transparent',
                    color: a.buttonStyle === 'filled' ? a.overlayBackgroundColor : a.overlayTextColor,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }
                },
                a.buttonText
              )
            )
          ) : el(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#f0f0f0',
                color: '#666'
              }
            },
            el('p', null, 'Выберите изображение в настройках блока →')
          )
        )
      );
    },

    save: function (props) {
      const a = props.attributes;
      const bp = (wp.blockEditor || wp.editor).useBlockProps.save({
        className: 'text-overlay-block',
        style: {
          '--text-overlay-min-height': (a.minHeight || 500) + 'px',
          '--text-overlay-bg': a.overlayBackgroundColor || '#ffffff',
          '--text-overlay-color': a.overlayTextColor || '#000000',
          '--text-overlay-padding': (a.overlayPadding || 40) + 'px',
          '--text-overlay-width': (a.overlayWidth || 45) + '%',
          '--text-overlay-text-align': a.textAlign || 'right',
          '--image-overlay-opacity': a.imageOverlayOpacity || 0
        }
      });

      return el(
        'div',
        bp,
        el(
          'div',
          { className: 'text-overlay-container' },
          el(
            'div',
            { className: 'text-overlay-image-wrapper' },
            el('img', {
              className: 'text-overlay-image',
              src: a.desktopImage,
              alt: a.imageAlt || '',
              'data-desktop-image': a.desktopImage || '',
              'data-mobile-image': a.mobileImage || ''
            }),
            a.imageOverlayOpacity > 0 && el('div', { className: 'text-overlay-image-overlay' })
          ),
          el(
            'div',
            {
              className: 'text-overlay-content',
              'data-position': a.overlayPosition || 'right',
              'data-vertical-align': a.overlayVerticalAlign || 'center',
              'data-button-style': a.buttonStyle || 'outline'
            },
            a.heading && el(RichText.Content, {
              tagName: 'h2',
              className: 'text-overlay-heading',
              value: a.heading
            }),
            a.text && el(RichText.Content, {
              tagName: 'p',
              className: 'text-overlay-text',
              value: a.text
            }),
            a.buttonText && a.buttonUrl && el(
              'a',
              {
                className: 'text-overlay-button',
                href: a.buttonUrl,
                target: a.buttonTarget || '_self',
                rel: a.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined
              },
              a.buttonText
            )
          )
        )
      );
    }
  });
})(window.wp);
