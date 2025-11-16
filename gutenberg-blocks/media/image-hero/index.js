/* eslint-disable no-undef */
( function ( wp ) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, __experimentalLinkControl: LinkControl } = be;
  const {
    Button,
    PanelBody,
    RangeControl,
    ToggleControl,
    TextControl,
    SelectControl,
    Modal,
    ColorPicker,
    Popover
  } = wp.components;

  // Build a slide object from selected media
  function slideFromMedia( m ) {
    return {
      id: m.id,
      desktopImage: m.url || '',
      mobileImage: '',
      heading: '',
      text: '',
      buttonText: '',
      buttonUrl: '',
      buttonTarget: '_self'
    };
  }

  // Simple array item mover
  function moveItem( arr, from, to ) {
    const a = ( arr || [] ).slice();
    if ( from < 0 || from >= a.length || to < 0 || to >= a.length ) return a;
    const [ x ] = a.splice( from, 1 );
    a.splice( to, 0, x );
    return a;
  }

  // Modal for editing or creating a slide
  function SlideModal( { initial, onSave, onRequestClose } ) {
    const [ item, setItem ] = useState(
      initial || {
        desktopImage: '',
        mobileImage: '',
        heading: '',
        text: '',
        buttonText: '',
        buttonUrl: '',
        buttonTarget: '_self'
      }
    );
    const [ showLinkPicker, setShowLinkPicker ] = useState( false );

    const set = ( patch ) => setItem( Object.assign( {}, item, patch ) );

    return el(
      Modal,
      {
        title: 'Редактировать слайд',
        className: 'image-hero-modal',
        onRequestClose,
        style: { maxWidth: '700px' }
      },
      el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', { style: { marginTop: 0 } }, 'Изображение для Desktop' ),
        el(
          MediaUploadCheck,
          null,
          el( MediaUpload, {
            onSelect: ( m ) => set( { desktopImage: m.url || '' } ),
            allowedTypes: [ 'image' ],
            render: ( { open } ) =>
              el(
                Button,
                { variant: 'secondary', onClick: open },
                item.desktopImage ? 'Изменить изображение' : 'Выбрать изображение'
              )
          } )
        ),
        item.desktopImage && el( 'img', { src: item.desktopImage, style: { maxWidth: '100%', marginTop: '10px', display: 'block' } } )
      ),
      el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', null, 'Изображение для Mobile' ),
        el(
          MediaUploadCheck,
          null,
          el( MediaUpload, {
            onSelect: ( m ) => set( { mobileImage: m.url || '' } ),
            allowedTypes: [ 'image' ],
            render: ( { open } ) =>
              el(
                Button,
                { variant: 'secondary', onClick: open },
                item.mobileImage ? 'Изменить изображение' : 'Выбрать изображение'
              )
          } )
        ),
        item.mobileImage && el( 'img', { src: item.mobileImage, style: { maxWidth: '100%', marginTop: '10px', display: 'block' } } ),
        ! item.mobileImage && el( 'p', { style: { fontSize: '12px', fontStyle: 'italic', color: '#666' } }, 'Опционально: если не выбрано, будет использоваться Desktop изображение' )
      ),
      el( TextControl, {
        label: 'Заголовок',
        value: item.heading || '',
        onChange: ( v ) => set( { heading: v } )
      } ),
      el( TextControl, {
        label: 'Текст',
        value: item.text || '',
        onChange: ( v ) => set( { text: v } ),
        help: 'Краткое описание'
      } ),
      el( TextControl, {
        label: 'Текст кнопки',
        value: item.buttonText || '',
        onChange: ( v ) => set( { buttonText: v } )
      } ),
      el(
        'div',
        { style: { marginBottom: '16px', position: 'relative' } },
        el( 'label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', lineHeight: '1.4', textTransform: 'uppercase' } }, 'Ссылка кнопки' ),
        el(
          'div',
          { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
          el( TextControl, {
            value: item.buttonUrl || '',
            onChange: ( v ) => set( { buttonUrl: v } ),
            placeholder: 'https://example.com',
            style: { flex: '1' }
          } ),
          el(
            Button,
            {
              icon: 'admin-links',
              variant: 'secondary',
              onClick: () => setShowLinkPicker( ! showLinkPicker ),
              label: 'Выбрать страницу'
            }
          )
        ),
        showLinkPicker && LinkControl && el(
          Popover,
          {
            position: 'bottom center',
            onClose: () => setShowLinkPicker( false )
          },
          el( LinkControl, {
            value: item.buttonUrl ? { url: item.buttonUrl, opensInNewTab: item.buttonTarget === '_blank' } : {},
            onChange: ( link ) => {
              set( {
                buttonUrl: link.url || '',
                buttonTarget: link.opensInNewTab ? '_blank' : '_self'
              } );
              setShowLinkPicker( false );
            },
            showSuggestions: true
          } )
        )
      ),
      el( SelectControl, {
        label: 'Открывать в',
        value: item.buttonTarget || '_self',
        options: [
          { label: 'Той же вкладке', value: '_self' },
          { label: 'Новой вкладке', value: '_blank' }
        ],
        onChange: ( v ) => set( { buttonTarget: v } )
      } ),
      el(
        'div',
        {
          style: {
            marginTop: '20px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #ddd',
            paddingTop: '15px'
          }
        },
        el(
          Button,
          { variant: 'secondary', onClick: onRequestClose },
          'Отмена'
        ),
        el(
          Button,
          {
            variant: 'primary',
            onClick: () => {
              onSave && onSave( item );
              onRequestClose && onRequestClose();
            }
          },
          'Сохранить'
        )
      )
    );
  }

  // Register the block
  registerBlockType( 'bemazal/image-hero', {
    edit: function ( props ) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [ modalOpen, setModalOpen ] = useState( false );
      const [ editIndex, setEditIndex ] = useState( -1 );
      const blockProps = useBlockProps( {
        className: 'image-hero-editor'
      } );

      function openNew() {
        setEditIndex( -1 );
        setModalOpen( true );
      }
      function openEdit( i ) {
        setEditIndex( i );
        setModalOpen( true );
      }
      function saveModal( item ) {
        if ( ! item ) return;
        const slides = ( a.slides || [] ).slice();
        if ( editIndex >= 0 ) {
          slides[ editIndex ] = item;
        } else {
          slides.push( item );
        }
        set( { slides } );
      }
      function removeAt( i ) {
        const slides = ( a.slides || [] ).slice();
        slides.splice( i, 1 );
        set( { slides } );
      }
      function moveUp( i ) {
        set( { slides: moveItem( a.slides, i, Math.max( 0, i - 1 ) ) } );
      }
      function moveDown( i ) {
        set( {
          slides: moveItem(
            a.slides,
            i,
            Math.min( ( a.slides || [] ).length - 1, i + 1 )
          )
        } );
      }

      // Inspector controls
      const inspector = el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: 'Настройки слайдера', initialOpen: true },
          el( ToggleControl, {
            label: 'Автовоспроизведение слайдера',
            checked: a.autoplay !== false,
            onChange: ( v ) => set( { autoplay: !! v } )
          } ),
          a.autoplay && el( RangeControl, {
            label: 'Задержка между слайдами (мс)',
            min: 1000,
            max: 10000,
            step: 500,
            value: a.autoplayDelay || 5000,
            onChange: ( v ) => set( { autoplayDelay: parseInt( v, 10 ) || 5000 } )
          } ),
          el( RangeControl, {
            label: 'Скорость анимации (мс)',
            min: 300,
            max: 2000,
            step: 100,
            value: a.speed || 1000,
            onChange: ( v ) => set( { speed: parseInt( v, 10 ) || 1000 } )
          } ),
          el( ToggleControl, {
            label: 'Зациклить слайдер',
            checked: a.loop !== false,
            onChange: ( v ) => set( { loop: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Показать пагинацию',
            checked: a.pagination !== false,
            onChange: ( v ) => set( { pagination: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Показать навигацию',
            checked: a.navigation !== false,
            onChange: ( v ) => set( { navigation: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Показать стрелку прокрутки',
            checked: typeof a.showScrollButton === 'boolean' ? a.showScrollButton : true,
            onChange: ( v ) => set( { showScrollButton: !! v } ),
            help: 'Анимированная стрелка прокрутки вниз'
          } )
        ),
        el(
          PanelBody,
          { title: 'Стили и размеры', initialOpen: false },
          el( RangeControl, {
            label: 'Минимальная высота (px)',
            min: 300,
            max: 1000,
            step: 50,
            value: a.minHeight || 600,
            onChange: ( v ) => set( { minHeight: parseInt( v, 10 ) || 600 } )
          } ),
          el( RangeControl, {
            label: 'Затемнение изображения',
            min: 0,
            max: 0.8,
            step: 0.1,
            value: typeof a.overlayOpacity === 'number' ? a.overlayOpacity : 0.3,
            onChange: ( v ) => set( { overlayOpacity: parseFloat( v ) } )
          } ),
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el( 'label', { style: { display: 'block', marginBottom: '8px', fontWeight: '600' } }, 'Цвет текста' ),
            el( ColorPicker, {
              color: a.textColor || '#ffffff',
              onChangeComplete: ( color ) => set( { textColor: color.hex } )
            } )
          ),
          el( SelectControl, {
            label: 'Горизонтальное выравнивание',
            value: a.contentAlign || 'center',
            options: [
              { label: 'Слева', value: 'left' },
              { label: 'По центру', value: 'center' },
              { label: 'Справа', value: 'right' }
            ],
            onChange: ( v ) => set( { contentAlign: v } )
          } ),
          el( SelectControl, {
            label: 'Вертикальное выравнивание',
            value: a.contentVerticalAlign || 'center',
            options: [
              { label: 'Сверху', value: 'flex-start' },
              { label: 'По центру', value: 'center' },
              { label: 'Снизу', value: 'flex-end' }
            ],
            onChange: ( v ) => set( { contentVerticalAlign: v } )
          } )
        )
      );

      // Render slides list
      const list = el(
        'div',
        blockProps,
        el( 'h3', null, 'Изображение Hero слайды' ),
        ( a.slides || [] ).length === 0 && el(
          'p',
          { style: { color: '#666', fontStyle: 'italic' } },
          'Добавьте слайды с изображениями для начала работы'
        ),
        el(
          'div',
          { className: 'image-hero-slides-list' },
          ( a.slides || [] ).map( ( s, i ) =>
            el(
              'div',
              { className: 'image-hero-slide-item', key: i },
              el(
                'div',
                { className: 'image-hero-slide-preview' },
                s.desktopImage
                  ? el( 'img', { src: s.desktopImage, alt: '' } )
                  : el( 'div', { className: 'image-hero-no-image' }, '🖼️')
              ),
              el(
                'div',
                { className: 'image-hero-slide-meta' },
                el( 'strong', null, s.heading || 'Без заголовка' ),
                el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, s.text || 'Нет описания' ),
                s.desktopImage && el( 'span', { style: { fontSize: '11px', color: '#666' } }, '🖥 Desktop изображение' ),
                el( 'br' ),
                s.mobileImage && el( 'span', { style: { fontSize: '11px', color: '#666' } }, '📱 Mobile изображение' )
              ),
              el(
                'div',
                { className: 'image-hero-slide-actions' },
                el( Button, {
                  icon: 'edit',
                  onClick: () => openEdit( i ),
                  label: 'Редактировать'
                } ),
                el( Button, {
                  icon: 'arrow-up-alt2',
                  onClick: () => moveUp( i ),
                  label: 'Вверх',
                  disabled: i === 0
                } ),
                el( Button, {
                  icon: 'arrow-down-alt2',
                  onClick: () => moveDown( i ),
                  label: 'Вниз',
                  disabled: i === ( a.slides || [] ).length - 1
                } ),
                el( Button, {
                  icon: 'trash',
                  isDestructive: true,
                  onClick: () => removeAt( i ),
                  label: 'Удалить'
                } )
              )
            )
          )
        ),
        el(
          'div',
          { style: { marginTop: '15px' } },
          el(
            Button,
            { variant: 'primary', onClick: () => openNew() },
            'Добавить слайд'
          )
        )
      );

      return el(
        Fragment,
        null,
        inspector,
        list,
        modalOpen &&
          el( SlideModal, {
            initial: editIndex >= 0 ? ( a.slides || [] )[ editIndex ] : null,
            onSave: saveModal,
            onRequestClose: () => setModalOpen( false )
          } )
      );
    },

    save: function ( props ) {
      const a = props.attributes;
      const bp = ( wp.blockEditor || wp.editor ).useBlockProps.save( {
        className: 'image-hero-block',
        style: {
          '--image-hero-min-height': ( a.minHeight || 600 ) + 'px',
          '--image-hero-overlay': `${a.overlayOpacity || 0.3}`,
          '--image-hero-text-color': a.textColor || '#ffffff',
          '--image-hero-content-align': a.contentAlign || 'center',
          '--image-hero-content-vertical': a.contentVerticalAlign || 'center'
        },
        'data-config': JSON.stringify( {
          autoplay: !! ( a.autoplay !== false ),
          autoplayDelay: a.autoplayDelay || 5000,
          speed: a.speed || 1000,
          loop: !! ( a.loop !== false ),
          pagination: !! ( a.pagination !== false ),
          navigation: !! ( a.navigation !== false )
        } )
      } );

      // Only show swiper if there are multiple slides
      const useSwiper = ( a.slides || [] ).length > 1;

      return el(
        'div',
        bp,
        el(
          'div',
          { className: useSwiper ? 'swiper image-hero-swiper' : 'image-hero-single' },
          el(
            'div',
            { className: useSwiper ? 'swiper-wrapper' : '' },
            ( a.slides || [] ).map( ( s, i ) =>
              el(
                'div',
                { className: useSwiper ? 'swiper-slide' : 'image-hero-slide', key: i },
                el(
                  'div',
                  { className: 'image-hero-image-container' },
                  el( 'img', {
                    className: 'image-hero-image',
                    src: s.desktopImage,
                    alt: s.heading || '',
                    'data-desktop-image': s.desktopImage || '',
                    'data-mobile-image': s.mobileImage || ''
                  } ),
                  el( 'div', { className: 'image-hero-overlay' } ),
                  el(
                    'div',
                    { className: 'image-hero-content' },
                    s.heading && el( 'h2', { className: 'image-hero-heading' }, s.heading ),
                    s.text && el( 'p', { className: 'image-hero-text' }, s.text ),
                    s.buttonText && s.buttonUrl && el(
                      'a',
                      {
                        className: 'image-hero-button',
                        href: s.buttonUrl,
                        target: s.buttonTarget || '_self',
                        rel: s.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined
                      },
                      s.buttonText
                    )
                  )
                )
              )
            )
          ),
          // Scroll down button
          a.showScrollButton !== false && el(
            'button',
            {
              className: 'image-hero-scroll-button',
              'aria-label': 'Scroll down',
              type: 'button'
            },
            el(
              'svg',
              {
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              },
              el( 'polyline', { points: '6 9 12 15 18 9' } )
            )
          ),
          useSwiper && a.pagination !== false && el( 'div', { className: 'swiper-pagination' } ),
          useSwiper && a.navigation !== false && el(
            Fragment,
            null,
            el( 'div', { className: 'swiper-button-prev' } ),
            el( 'div', { className: 'swiper-button-next' } )
          )
        )
      );
    }
  } );
} )( window.wp );
