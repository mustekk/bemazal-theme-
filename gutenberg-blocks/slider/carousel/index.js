/* eslint-disable no-undef */
( function ( wp ) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } = be;
  const {
    Button,
    PanelBody,
    RangeControl,
    ToggleControl,
    TextControl,
    Modal
  } = wp.components;

  // Helper: pick a URL from the available sizes on a media object.
  function getUrlBySize( m, slug ) {
    const sizes =
      ( m && ( m.sizes || ( m.media_details && m.media_details.sizes ) ) ) || {};
    if ( sizes && sizes[ slug ] && sizes[ slug ].url ) return sizes[ slug ].url;
    if ( m && m.sizes && m.sizes[ slug ] && m.sizes[ slug ].url )
      return m.sizes[ slug ].url;
    return m && m.url ? m.url : '';
  }

  // Build a slide object from a selected media item.  Per‑slide darkening and
  // hover effects are omitted because those settings are handled globally on
  // the block.  `linkLabel` holds the visible text for the link button.
  function slideFromMedia( m ) {
    const title =
      ( m && ( m.title && ( m.title.rendered || m.title ) ) ) || m.title || '';
    const alt = ( m && ( m.alt || m.alt_text ) ) || '';
    return {
      id: m.id,
      alt: alt || title || '',
      title: title || '',
      url:
        getUrlBySize( m, 'medium' ) ||
        getUrlBySize( m, 'medium_large' ) ||
        getUrlBySize( m, 'large' ) ||
        getUrlBySize( m, 'full' ),
      urlsBySize: {
        thumbnail: getUrlBySize( m, 'thumbnail' ),
        medium: getUrlBySize( m, 'medium' ),
        medium_large: getUrlBySize( m, 'medium_large' ),
        large: getUrlBySize( m, 'large' ),
        full: getUrlBySize( m, 'full' )
      },
      linkUrl: '',
      linkLabel: ''
    };
  }

  // Simple array item mover.
  function moveItem( arr, from, to ) {
    const a = ( arr || [] ).slice();
    if ( from < 0 || from >= a.length || to < 0 || to >= a.length ) return a;
    const [ x ] = a.splice( from, 1 );
    a.splice( to, 0, x );
    return a;
  }

  // Modal for editing or creating a slide.  Presents fields for the image, title,
  // link selection and optional link label.  When a link picker component is
  // available (e.g. LinkControl from the block editor), it will be used to
  // provide search suggestions over existing site content.  Otherwise it falls
  // back to a simple text input.
  function SlideModal( { initial, onSave, onRequestClose } ) {
    const [ item, setItem ] = useState(
      initial || { title: '', linkUrl: '', linkLabel: '', id: 0, url: '' }
    );

    const set = ( patch ) => setItem( Object.assign( {}, item, patch ) );
    const onSelect = ( m ) => set( slideFromMedia( m ) );

    // Determine which link control is available.  If the experimental
    // LinkControl exists use it; otherwise fall back to URLInput.  In the
    // absence of either component, a plain TextControl is rendered.
    const LinkControlComp = ( be && ( be.__experimentalLinkControl || be.LinkControl ) ) || null;
    const URLInputComp = ( be && be.URLInput ) || null;

    // Render the link input based on the available component.
    function renderLinkInput() {
      // Label wrapper to align with other TextControl fields
      const label = el( 'div', { className: 'components-base-control__label' }, 'Ссылка (URL)' );
      if ( LinkControlComp ) {
        return el(
          'div',
          { className: 'scb-link-field' },
          label,
          el( LinkControlComp, {
            value: { url: item.linkUrl || '', title: item.linkLabel || '' },
            searchInputPlaceholder: 'Введите URL или выберите страницу',
            settings: [],
            onChange: function ( newValue ) {
              // Always update the URL
              const newUrl = ( newValue && newValue.url ) || '';
              const newTitle = ( newValue && newValue.title ) || '';
              // Preserve existing link label if user has typed one; otherwise
              // adopt the selected post/page title as the label.
              set( {
                linkUrl: newUrl,
                linkLabel: item.linkLabel && item.linkLabel.trim() ? item.linkLabel : newTitle
              } );
            },
            // Always allow direct entry of custom URLs
            withCreateSuggestion: true,
            createSuggestion: function ( inputValue ) {
              // When creating a custom URL, just return an object with
              // url and title equal to the input string.
              return {
                url: inputValue,
                title: inputValue
              };
            },
            createSuggestionButtonText: function ( value ) {
              return 'Новая: ' + value;
            }
          } )
        );
      }
      if ( URLInputComp ) {
        return el(
          'div',
          { className: 'scb-link-field' },
          label,
          el( URLInputComp, {
            value: item.linkUrl || '',
            onChange: function ( newUrl, post ) {
              // newUrl is the string entered; post is an optional post object
              const suggestedTitle = post && post.title ? post.title : '';
              set( {
                linkUrl: newUrl || '',
                linkLabel: item.linkLabel && item.linkLabel.trim() ? item.linkLabel : suggestedTitle
              } );
            },
            placeholder: 'https://example.com',
            className: 'components-url-input__input'
          } )
        );
      }
      // Fallback: plain text control
      return el( TextControl, {
        label: 'Ссылка (URL)',
        value: item.linkUrl || '',
        onChange: ( v ) => set( { linkUrl: v } )
      } );
    }

    return el(
      Modal,
      {
        title: 'Слайд',
        className: 'scb-modal',
        onRequestClose
      },
      el(
        'div',
        { className: 'scb-media-row' },
        el(
          'div',
          { className: 'scb-media-thumb' },
          item && item.url ? el( 'img', { src: item.url, alt: '' } ) : null
        ),
        el(
          MediaUploadCheck,
          null,
          el( MediaUpload, {
            onSelect,
            value: item.id || undefined,
            allowedTypes: [ 'image' ],
            render: ( { open } ) =>
              el(
                Button,
                { variant: 'secondary', onClick: open },
                item && item.url ? 'Заменить изображение' : 'Выбрать изображение'
              )
          } )
        )
      ),
      el( TextControl, {
        label: 'Заголовок',
        value: item.title || '',
        onChange: ( v ) => set( { title: v } )
      } ),
      renderLinkInput(),
      el( TextControl, {
        label: 'Текст ссылки (опц.)',
        value: item.linkLabel || '',
        onChange: ( v ) => set( { linkLabel: v } )
      } ),
      el(
        'div',
        {
          style: {
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
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

  // Register the block.
  registerBlockType( 'scb/swiper-carousel', {
    edit: function ( props ) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [ modalOpen, setModalOpen ] = useState( false );
      const [ editIndex, setEditIndex ] = useState( -1 );
      const blockProps = useBlockProps( {
        className: 'scb-swiper-carousel-editor',
        style: { '--scb-max-w': ( ( a.maxW || 1200 ) + 'px' ) }
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
      function replaceAt( i, m ) {
        const slides = ( a.slides || [] ).slice();
        slides[ i ] = slideFromMedia( m );
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

      // Inspector: all settings grouped in a single panel.
      const inspector = el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: 'Параметры карусели', initialOpen: true },
          el( ToggleControl, {
            label: 'Autoplay',
            checked: a.autoplay !== false,
            onChange: ( v ) => set( { autoplay: !! v } )
          } ),
          el( RangeControl, {
            label: 'Задержка (мс)',
            min: 500,
            max: 10000,
            step: 100,
            value: a.autoplayDelay || 3000,
            onChange: ( v ) =>
              set( {
                autoplayDelay: parseInt( v || 0, 10 ) || 3000
              } )
          } ),
          el( RangeControl, {
            label: 'Скорость анимации (мс)',
            min: 100,
            max: 5000,
            step: 50,
            value: a.speed || 500,
            onChange: ( v ) =>
              set( {
                speed: parseInt( v || 0, 10 ) || 500
              } )
          } ),
          el( ToggleControl, {
            label: 'Затемнение изображений',
            checked: !! a.darkenEnabled,
            onChange: ( v ) => set( { darkenEnabled: !! v } )
          } ),
          a.darkenEnabled
            ? el( RangeControl, {
                label: 'Интенсивность затемнения',
                min: 0,
                max: 0.9,
                step: 0.05,
                value:
                  typeof a.darkenLevel === 'number' ? a.darkenLevel : 0.3,
                onChange: ( v ) =>
                  set( {
                    darkenLevel: parseFloat( v || 0 )
                  } )
              } )
            : null,
          el( ToggleControl, {
            label: 'Зум‑эффект (глобально)',
            checked: !! a.zoomEnabled,
            onChange: ( v ) => set( { zoomEnabled: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Loop',
            checked: a.loop !== false,
            onChange: ( v ) => set( { loop: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Centered slides',
            checked: !! a.centered,
            onChange: ( v ) => set( { centered: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Пагинация (точки)',
            checked: a.pagination !== false,
            onChange: ( v ) => set( { pagination: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Навигация (стрелки)',
            checked: a.navigation !== false,
            onChange: ( v ) => set( { navigation: !! v } )
          } ),
          el( RangeControl, {
            label: 'Отступ между слайдами (px)',
            min: 0,
            max: 64,
            step: 1,
            value: a.spaceBetween || 16,
            onChange: ( v ) =>
              set( {
                spaceBetween: parseInt( v || 0, 10 ) || 0
              } )
          } ),
          el( RangeControl, {
            label: 'Слайды на мобиле',
            min: 1,
            max: 3,
            step: 1,
            value: a.slidesMobile || 1,
            onChange: ( v ) =>
              set( {
                slidesMobile: parseInt( v || 0, 10 ) || 1
              } )
          } ),
          el( RangeControl, {
            label: 'Слайды на планшете',
            min: 1,
            max: 4,
            step: 1,
            value: a.slidesTablet || 2,
            onChange: ( v ) =>
              set( {
                slidesTablet: parseInt( v || 0, 10 ) || 2
              } )
          } ),
          el( RangeControl, {
            label: 'Слайды на десктопе',
            min: 1,
            max: 6,
            step: 1,
            value: a.slidesDesktop || 3,
            onChange: ( v ) =>
              set( {
                slidesDesktop: parseInt( v || 0, 10 ) || 3
              } )
          } ),
          el( RangeControl, {
            label: 'Max‑width контейнера (px)',
            min: 320,
            max: 2400,
            step: 10,
            value: a.maxW || 1200,
            onChange: ( v ) =>
              set( {
                maxW: parseInt( v || 0, 10 ) || 1200
              } )
          } ),
          el( TextControl, {
            label: 'Aspect‑ratio (напр. 16/9, 4/3, 1/1)',
            value: a.ratio || '16/9',
            onChange: ( v ) =>
              set( {
                ratio: v || '16/9'
              } )
          } ),
          el( ToggleControl, {
            label: 'Открывать ссылки в новой вкладке',
            checked: a.openInNew !== false,
            onChange: ( v ) => set( { openInNew: !! v } )
          } )
        )
      );

      // Render the list of slides and add controls.
      const list = el(
        'div',
        blockProps,
        el(
          'div',
          { className: 'scb-slides-list' },
          ( a.slides || [] ).map( ( s, i ) =>
            el(
              'div',
              { className: 'scb-slide-item', key: i },
              el(
                'div',
                { className: 'scb-slide-thumb' },
                s && s.url ? el( 'img', { src: s.url, alt: '' } ) : null
              ),
              el(
                'div',
                { className: 'scb-slide-meta' },
                el(
                  'div',
                  { className: 'scb-slide-title' },
                  s.title || s.alt || 'Без названия'
                ),
                el(
                  'div',
                  { className: 'scb-slide-url' },
                  ( s.linkUrl || '' )
                    .replace( /^https?:\/\//, '' )
                    .slice( 0, 60 )
                )
              ),
              el(
                'div',
                { className: 'scb-slide-actions' },
                el( Button, {
                  icon: 'edit',
                  onClick: () => openEdit( i ),
                  label: 'Редактировать'
                } ),
                el(
                  MediaUploadCheck,
                  null,
                  el(
                    MediaUpload,
                    {
                      onSelect: ( m ) => replaceAt( i, m ),
                      allowedTypes: [ 'image' ],
                      render: ( { open } ) =>
                        el(
                          Button,
                          { icon: 'format-image', onClick: open, label: 'Заменить' },
                          null
                        )
                    }
                  )
                ),
                el( Button, {
                  icon: 'arrow-up-alt2',
                  onClick: () => moveUp( i ),
                  label: 'Вверх'
                } ),
                el( Button, {
                  icon: 'arrow-down-alt2',
                  onClick: () => moveDown( i ),
                  label: 'Вниз'
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
          { className: 'scb-add-wrap' },
          el(
            MediaUploadCheck,
            null,
            el( MediaUpload, {
              gallery: true,
              multiple: true,
              allowedTypes: [ 'image' ],
              onSelect: ( items ) => {
                const slides = ( a.slides || [] )
                  .slice()
                  .concat( ( items || [] ).map( slideFromMedia ) );
                set( { slides } );
              },
              render: ( { open } ) =>
                el(
                  Button,
                  { variant: 'primary', onClick: open },
                  'Добавить слайды'
                )
            } )
          ),
          el(
            Button,
            { style: { marginLeft: '8px' }, onClick: () => openNew() },
            'Создать слайд'
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
        className:
          'scb-swiper-carousel' + ( a.zoomEnabled ? ' scb-zoom-on' : '' ),
        style: {
          '--scb-max-w': ( ( a.maxW || 1200 ) + 'px' ),
          '--scb-aspect': a.ratio || '16/9',
          '--scb-overlay':
            a.darkenEnabled
              ? typeof a.darkenLevel === 'number'
                ? a.darkenLevel
                : 0.3
              : 0
        },
        'data-config': JSON.stringify( {
          autoplay: !! ( a.autoplay !== false ),
          autoplayDelay: a.autoplayDelay || 3000,
          speed: a.speed || 500,
          loop: !! ( a.loop !== false ),
          centered: !! a.centered,
          pagination: !! ( a.pagination !== false ),
          navigation: !! ( a.navigation !== false ),
          spaceBetween: a.spaceBetween || 0,
          slidesMobile: a.slidesMobile || 1,
          slidesTablet: a.slidesTablet || 2,
          slidesDesktop: a.slidesDesktop || 3,
          openInNew: a.openInNew !== false
        } )
      } );

      function urlOf( s ) {
        if ( ! s ) return '';
        if (
          s.urlsBySize &&
          ( s.urlsBySize.medium ||
            s.urlsBySize.medium_large ||
            s.urlsBySize.large ||
            s.urlsBySize.full )
        )
          return (
            s.urlsBySize.medium ||
            s.urlsBySize.medium_large ||
            s.urlsBySize.large ||
            s.urlsBySize.full
          );
        return s.url || '';
      }
      function relTarget( a ) {
        return a.openInNew !== false ? 'noopener noreferrer nofollow' : undefined;
      }
      function target( a ) {
        return a.openInNew !== false ? '_blank' : undefined;
      }

      return el(
        'div',
        bp,
        el(
          'div',
          { className: 'swiper' },
          el(
            'div',
            { className: 'swiper-wrapper' },
            ( a.slides || [] ).map( ( s, i ) =>
              el(
                'div',
                { className: 'swiper-slide', key: 's' + i },
                el(
                  'div',
                  { className: 'scb-slide-inner' },
                  el( 'img', {
                    src: urlOf( s ),
                    alt: s.alt || s.title || '',
                    loading: 'lazy',
                    decoding: 'async'
                  } ),
                  el( 'span', {
                    className: 'scb-overlay',
                    'aria-hidden': 'true'
                  } ),
                  el(
                    'div',
                    { className: 'scb-ui' },
                    s.title
                      ? el(
                          'span',
                          { className: 'scb-title' },
                          s.title
                        )
                      : null,
                    s.linkUrl
                      ? el(
                          'a',
                          {
                            className: 'scb-slide-link',
                            href: s.linkUrl,
                            target: target( a ),
                            rel: relTarget( a )
                          },
                          el(
                            'span',
                            { className: 'scb-link-label' },
                            s.linkLabel && s.linkLabel.trim()
                              ? s.linkLabel
                              : 'Подробнее'
                          )
                        )
                      : null
                  )
                )
              )
            )
          ),
          a.pagination !== false
            ? el( 'div', { className: 'swiper-pagination' } )
            : null,
          a.navigation !== false
            ? el(
                Fragment,
                null,
                el( 'div', { className: 'swiper-button-prev' } ),
                el( 'div', { className: 'swiper-button-next' } )
              )
            : null
        )
      );
    }
  } );
} )( window.wp );