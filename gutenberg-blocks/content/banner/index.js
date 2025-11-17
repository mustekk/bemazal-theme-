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
    SelectControl,
    ColorPicker,
    ButtonGroup,
    Popover
  } = wp.components;

  registerBlockType('bemazal/content-banner', {
    edit: function (props) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [showLinkPicker, setShowLinkPicker] = useState(false);

      const blockProps = useBlockProps({
        className: 'content-banner-editor',
        style: {
          minHeight: (a.minHeight || 400) + 'px',
          backgroundColor: a.backgroundType === 'color' ? a.backgroundColor : 'transparent',
          backgroundImage: a.backgroundType === 'image' && a.backgroundImage
            ? `url(${a.backgroundImage})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: a.alignVertical || 'center',
          justifyContent: a.alignHorizontal || 'center'
        }
      });

      const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `rgba(0, 0, 0, ${a.backgroundType === 'image' ? (a.overlayOpacity || 0.3) : 0})`,
        zIndex: 1
      };

      const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: (a.maxWidth || 800) + 'px',
        padding: (a.contentPadding || 40) + 'px',
        textAlign: a.alignHorizontal || 'center',
        color: a.textColor || '#ffffff',
        width: '100%'
      };

      const buttonStyle = {
        display: 'inline-block',
        padding: '12px 32px',
        backgroundColor: a.buttonStyle === 'filled' ? (a.buttonColor || '#ffffff') : 'transparent',
        color: a.buttonStyle === 'filled' ? (a.buttonTextColor || '#0066cc') : (a.buttonColor || '#ffffff'),
        border: a.buttonStyle === 'outline' ? `2px solid ${a.buttonColor || '#ffffff'}` : 'none',
        borderRadius: '4px',
        textDecoration: 'none',
        fontWeight: 'bold',
        cursor: 'pointer'
      };

      const inspector = el(
        InspectorControls,
        null,
        // Контент
        el(
          PanelBody,
          { title: 'Контент', initialOpen: true },
          el('p', { style: { fontSize: '12px', color: '#666', marginBottom: '16px' } },
            'Редактируйте текст прямо на блоке'
          ),
          el('hr', { style: { margin: '16px 0' } }),
          el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Ссылка кнопки'),
          el('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' } },
            el('input', {
              type: 'text',
              value: a.buttonUrl || '',
              onChange: (e) => set({ buttonUrl: e.target.value }),
              placeholder: 'https://example.com',
              style: {
                flex: '1',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }
            }),
            LinkControl && el(
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
          ),
          el(SelectControl, {
            label: 'Открывать в',
            value: a.buttonTarget || '_self',
            options: [
              { label: 'Той же вкладке', value: '_self' },
              { label: 'Новой вкладке', value: '_blank' }
            ],
            onChange: (v) => set({ buttonTarget: v })
          })
        ),
        // Выравнивание
        el(
          PanelBody,
          { title: 'Выравнивание', initialOpen: false },
          el(SelectControl, {
            label: 'Горизонтальное выравнивание',
            value: a.alignHorizontal || 'center',
            options: [
              { label: 'Слева', value: 'left' },
              { label: 'По центру', value: 'center' },
              { label: 'Справа', value: 'right' }
            ],
            onChange: (v) => set({ alignHorizontal: v })
          }),
          el(SelectControl, {
            label: 'Вертикальное выравнивание',
            value: a.alignVertical || 'center',
            options: [
              { label: 'Сверху', value: 'flex-start' },
              { label: 'По центру', value: 'center' },
              { label: 'Снизу', value: 'flex-end' }
            ],
            onChange: (v) => set({ alignVertical: v })
          })
        ),
        // Фон
        el(
          PanelBody,
          { title: 'Фон', initialOpen: false },
          el('label', { style: { display: 'block', marginBottom: '12px', fontWeight: '600' } }, 'Тип фона'),
          el(
            ButtonGroup,
            { style: { marginBottom: '16px', width: '100%' } },
            el(
              Button,
              {
                variant: a.backgroundType === 'color' ? 'primary' : 'secondary',
                onClick: () => set({ backgroundType: 'color' }),
                style: { flex: 1 }
              },
              'Цвет'
            ),
            el(
              Button,
              {
                variant: a.backgroundType === 'image' ? 'primary' : 'secondary',
                onClick: () => set({ backgroundType: 'image' }),
                style: { flex: 1 }
              },
              'Изображение'
            )
          ),
          a.backgroundType === 'color' && el(
            Fragment,
            null,
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет фона'),
            el(ColorPicker, {
              color: a.backgroundColor || '#0066cc',
              onChangeComplete: (color) => set({ backgroundColor: color.hex })
            })
          ),
          a.backgroundType === 'image' && el(
            Fragment,
            null,
            el('h4', { style: { marginTop: 0, marginBottom: '12px' } }, 'Desktop изображение'),
            el(
              MediaUploadCheck,
              null,
              el(MediaUpload, {
                onSelect: (m) => set({ backgroundImage: m.url || '' }),
                allowedTypes: ['image'],
                render: ({ open }) =>
                  el(
                    Button,
                    { variant: 'secondary', onClick: open, style: { marginBottom: '12px' } },
                    a.backgroundImage ? 'Изменить изображение' : 'Выбрать изображение'
                  )
              })
            ),
            a.backgroundImage && el('img', {
              src: a.backgroundImage,
              style: { maxWidth: '100%', marginBottom: '16px', display: 'block', borderRadius: '4px' }
            }),
            el('h4', { style: { marginBottom: '12px' } }, 'Mobile изображение (опционально)'),
            el(
              MediaUploadCheck,
              null,
              el(MediaUpload, {
                onSelect: (m) => set({ backgroundImageMobile: m.url || '' }),
                allowedTypes: ['image'],
                render: ({ open }) =>
                  el(
                    Button,
                    { variant: 'secondary', onClick: open, style: { marginBottom: '12px' } },
                    a.backgroundImageMobile ? 'Изменить изображение' : 'Выбрать изображение'
                  )
              })
            ),
            a.backgroundImageMobile && el('img', {
              src: a.backgroundImageMobile,
              style: { maxWidth: '100%', marginBottom: '16px', display: 'block', borderRadius: '4px' }
            }),
            el(RangeControl, {
              label: 'Затемнение изображения',
              min: 0,
              max: 0.9,
              step: 0.1,
              value: a.overlayOpacity !== undefined ? a.overlayOpacity : 0.3,
              onChange: (v) => set({ overlayOpacity: parseFloat(v) })
            })
          )
        ),
        // Размеры и отступы
        el(
          PanelBody,
          { title: 'Размеры и отступы', initialOpen: false },
          el(RangeControl, {
            label: 'Минимальная высота (px)',
            min: 200,
            max: 1000,
            step: 50,
            value: a.minHeight || 400,
            onChange: (v) => set({ minHeight: parseInt(v, 10) || 400 })
          }),
          el(RangeControl, {
            label: 'Максимальная ширина контента (px)',
            min: 400,
            max: 1400,
            step: 50,
            value: a.maxWidth || 800,
            onChange: (v) => set({ maxWidth: parseInt(v, 10) || 800 })
          }),
          el(RangeControl, {
            label: 'Отступы контента (px)',
            min: 0,
            max: 100,
            step: 5,
            value: a.contentPadding || 40,
            onChange: (v) => set({ contentPadding: parseInt(v, 10) || 40 })
          })
        ),
        // Цвета
        el(
          PanelBody,
          { title: 'Цвета', initialOpen: false },
          el('div', { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет текста'),
            el(ColorPicker, {
              color: a.textColor || '#ffffff',
              onChangeComplete: (color) => set({ textColor: color.hex })
            })
          ),
          el('hr', { style: { margin: '16px 0' } }),
          el('label', { style: { display: 'block', marginBottom: '12px', fontWeight: '600' } }, 'Стиль кнопки'),
          el(
            ButtonGroup,
            { style: { marginBottom: '16px', width: '100%' } },
            el(
              Button,
              {
                variant: a.buttonStyle === 'filled' ? 'primary' : 'secondary',
                onClick: () => set({ buttonStyle: 'filled' }),
                style: { flex: 1 }
              },
              'Заливка'
            ),
            el(
              Button,
              {
                variant: a.buttonStyle === 'outline' ? 'primary' : 'secondary',
                onClick: () => set({ buttonStyle: 'outline' }),
                style: { flex: 1 }
              },
              'Контур'
            )
          ),
          el('div', { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } },
              a.buttonStyle === 'filled' ? 'Цвет фона кнопки' : 'Цвет контура кнопки'
            ),
            el(ColorPicker, {
              color: a.buttonColor || '#ffffff',
              onChangeComplete: (color) => set({ buttonColor: color.hex })
            })
          ),
          a.buttonStyle === 'filled' && el('div', { style: { marginBottom: '16px' } },
            el('label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет текста кнопки'),
            el(ColorPicker, {
              color: a.buttonTextColor || '#0066cc',
              onChangeComplete: (color) => set({ buttonTextColor: color.hex })
            })
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
          el('div', { style: overlayStyle }),
          el(
            'div',
            { style: contentStyle },
            el(RichText, {
              tagName: 'h2',
              value: a.heading,
              onChange: (v) => set({ heading: v }),
              placeholder: 'Введите заголовок...',
              style: {
                fontSize: '2.5rem',
                marginBottom: '1rem',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }
            }),
            el(RichText, {
              tagName: 'p',
              value: a.paragraph,
              onChange: (v) => set({ paragraph: v }),
              placeholder: 'Введите текст параграфа...',
              style: {
                fontSize: '1.125rem',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }
            }),
            el(RichText, {
              tagName: 'span',
              value: a.buttonText,
              onChange: (v) => set({ buttonText: v }),
              placeholder: 'Текст кнопки',
              style: buttonStyle
            })
          )
        )
      );
    },

    save: function (props) {
      const a = props.attributes;
      const bp = (wp.blockEditor || wp.editor).useBlockProps.save({
        className: 'content-banner-block',
        style: {
          '--banner-min-height': (a.minHeight || 400) + 'px',
          '--banner-bg-color': a.backgroundColor || '#0066cc',
          '--banner-overlay': a.overlayOpacity !== undefined ? a.overlayOpacity : 0.3,
          '--banner-text-color': a.textColor || '#ffffff',
          '--banner-align-h': a.alignHorizontal || 'center',
          '--banner-align-v': a.alignVertical || 'center',
          '--banner-max-width': (a.maxWidth || 800) + 'px',
          '--banner-padding': (a.contentPadding || 40) + 'px',
          '--banner-btn-bg': a.buttonColor || '#ffffff',
          '--banner-btn-text': a.buttonTextColor || '#0066cc',
          '--banner-btn-border': a.buttonStyle === 'outline' ? `2px solid ${a.buttonColor || '#ffffff'}` : 'none'
        },
        'data-bg-type': a.backgroundType || 'color',
        'data-bg-desktop': a.backgroundImage || '',
        'data-bg-mobile': a.backgroundImageMobile || '',
        'data-btn-style': a.buttonStyle || 'filled'
      });

      return el(
        'div',
        bp,
        el('div', { className: 'content-banner-overlay' }),
        el(
          'div',
          { className: 'content-banner-content' },
          a.heading && el(RichText.Content, {
            tagName: 'h2',
            value: a.heading,
            className: 'content-banner-heading'
          }),
          a.paragraph && el(RichText.Content, {
            tagName: 'p',
            value: a.paragraph,
            className: 'content-banner-paragraph'
          }),
          a.buttonText && a.buttonUrl && el(
            'a',
            {
              href: a.buttonUrl,
              className: 'content-banner-button',
              target: a.buttonTarget || '_self',
              rel: a.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined
            },
            el(RichText.Content, {
              tagName: 'span',
              value: a.buttonText
            })
          )
        )
      );
    }
  });
})(window.wp);
