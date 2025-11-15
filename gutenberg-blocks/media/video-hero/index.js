/* eslint-disable no-undef */
( function ( wp ) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, RichText, __experimentalLinkControl: LinkControl } = be;
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

  // Helper: Get video URL from media object
  function getVideoUrl( media, type = 'desktop' ) {
    if ( ! media ) return '';

    // If media has desktop/mobile specific URLs
    if ( type === 'mobile' && media.mobileUrl ) {
      return media.mobileUrl;
    }

    return media.url || '';
  }

  // Helper: Convert YouTube URL to embed URL
  function getYouTubeEmbedUrl( url ) {
    if ( ! url ) return '';

    // Extract video ID from various YouTube URL formats
    let videoId = '';

    // youtu.be format
    const shortMatch = url.match( /youtu\.be\/([a-zA-Z0-9_-]+)/ );
    if ( shortMatch ) {
      videoId = shortMatch[1];
    } else {
      // youtube.com format
      const longMatch = url.match( /[?&]v=([a-zA-Z0-9_-]+)/ );
      if ( longMatch ) {
        videoId = longMatch[1];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0` : '';
  }

  // Helper: Convert Vimeo URL to embed URL
  function getVimeoEmbedUrl( url ) {
    if ( ! url ) return '';

    // Extract video ID from Vimeo URL
    const match = url.match( /vimeo\.com\/(\d+)/ );

    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&background=1` : '';
  }

  // Build a slide object from selected media
  function slideFromMedia( m ) {
    return {
      id: m.id,
      videoType: 'uploaded',
      desktopVideoMp4: m.url || '',
      desktopVideoWebm: '',
      mobileVideoMp4: '',
      mobileVideoWebm: '',
      youtubeUrl: '',
      vimeoUrl: '',
      desktopPoster: m.thumb || '',
      mobilePoster: '',
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
        videoType: 'uploaded',
        desktopVideoMp4: '',
        desktopVideoWebm: '',
        mobileVideoMp4: '',
        mobileVideoWebm: '',
        youtubeUrl: '',
        vimeoUrl: '',
        desktopPoster: '',
        mobilePoster: '',
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
        title: 'Редактировать видео слайд',
        className: 'video-hero-modal',
        onRequestClose,
        style: { maxWidth: '700px' }
      },
      el( SelectControl, {
        label: 'Тип видео',
        value: item.videoType || 'uploaded',
        options: [
          { label: 'Загруженное видео', value: 'uploaded' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' }
        ],
        onChange: ( v ) => set( { videoType: v } ),
        help: 'Выберите источник видео'
      } ),
      item.videoType === 'youtube' && el( TextControl, {
        label: 'YouTube URL',
        value: item.youtubeUrl || '',
        onChange: ( v ) => set( { youtubeUrl: v } ),
        placeholder: 'https://www.youtube.com/watch?v=... или https://youtu.be/...',
        help: 'Вставьте ссылку на YouTube видео'
      } ),
      item.videoType === 'vimeo' && el( TextControl, {
        label: 'Vimeo URL',
        value: item.vimeoUrl || '',
        onChange: ( v ) => set( { vimeoUrl: v } ),
        placeholder: 'https://vimeo.com/...',
        help: 'Вставьте ссылку на Vimeo видео'
      } ),
      item.videoType === 'uploaded' && el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', { style: { marginTop: 0 } }, 'Видео для Desktop' ),
        el(
          'div',
          { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
          el(
            MediaUploadCheck,
            null,
            el( MediaUpload, {
              onSelect: ( m ) => set( { desktopVideoMp4: m.url || '' } ),
              allowedTypes: [ 'video' ],
              render: ( { open } ) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  item.desktopVideoMp4 ? 'Изменить MP4' : 'Выбрать MP4'
                )
            } )
          ),
          el(
            MediaUploadCheck,
            null,
            el( MediaUpload, {
              onSelect: ( m ) => set( { desktopVideoWebm: m.url || '' } ),
              allowedTypes: [ 'video' ],
              render: ( { open } ) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  item.desktopVideoWebm ? 'Изменить WebM' : 'Выбрать WebM'
                )
            } )
          )
        ),
        item.desktopVideoMp4 && el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, 'MP4: ', item.desktopVideoMp4.split('/').pop() ),
        item.desktopVideoWebm && el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, 'WebM: ', item.desktopVideoWebm.split('/').pop() )
      ),
      item.videoType === 'uploaded' && el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', null, 'Видео для Mobile' ),
        el(
          'div',
          { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
          el(
            MediaUploadCheck,
            null,
            el( MediaUpload, {
              onSelect: ( m ) => set( { mobileVideoMp4: m.url || '' } ),
              allowedTypes: [ 'video' ],
              render: ( { open } ) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  item.mobileVideoMp4 ? 'Изменить MP4' : 'Выбрать MP4'
                )
            } )
          ),
          el(
            MediaUploadCheck,
            null,
            el( MediaUpload, {
              onSelect: ( m ) => set( { mobileVideoWebm: m.url || '' } ),
              allowedTypes: [ 'video' ],
              render: ( { open } ) =>
                el(
                  Button,
                  { variant: 'secondary', onClick: open },
                  item.mobileVideoWebm ? 'Изменить WebM' : 'Выбрать WebM'
                )
            } )
          )
        ),
        item.mobileVideoMp4 && el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, 'MP4: ', item.mobileVideoMp4.split('/').pop() ),
        item.mobileVideoWebm && el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, 'WebM: ', item.mobileVideoWebm.split('/').pop() )
      ),
      item.videoType === 'uploaded' && el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', null, 'Poster изображение - Desktop' ),
        el(
          MediaUploadCheck,
          null,
          el( MediaUpload, {
            onSelect: ( m ) => set( { desktopPoster: m.url || '' } ),
            allowedTypes: [ 'image' ],
            render: ( { open } ) =>
              el(
                Button,
                { variant: 'secondary', onClick: open },
                item.desktopPoster ? 'Изменить Desktop Poster' : 'Выбрать Desktop Poster'
              )
          } )
        ),
        item.desktopPoster && el( 'img', { src: item.desktopPoster, style: { maxWidth: '200px', marginTop: '10px', display: 'block' } } )
      ),
      item.videoType === 'uploaded' && el(
        'div',
        { style: { marginBottom: '20px' } },
        el( 'h3', null, 'Poster изображение - Mobile' ),
        el(
          MediaUploadCheck,
          null,
          el( MediaUpload, {
            onSelect: ( m ) => set( { mobilePoster: m.url || '' } ),
            allowedTypes: [ 'image' ],
            render: ( { open } ) =>
              el(
                Button,
                { variant: 'secondary', onClick: open },
                item.mobilePoster ? 'Изменить Mobile Poster' : 'Выбрать Mobile Poster'
              )
          } )
        ),
        item.mobilePoster && el( 'img', { src: item.mobilePoster, style: { maxWidth: '200px', marginTop: '10px', display: 'block' } } ),
        ! item.mobilePoster && el( 'p', { style: { fontSize: '12px', fontStyle: 'italic', color: '#666' } }, 'Опционально: если не выбрано, будет использоваться Desktop poster' )
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
  registerBlockType( 'bemazal/video-hero', {
    edit: function ( props ) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [ modalOpen, setModalOpen ] = useState( false );
      const [ editIndex, setEditIndex ] = useState( -1 );
      const blockProps = useBlockProps( {
        className: 'video-hero-editor'
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
          } )
        ),
        el(
          PanelBody,
          { title: 'Настройки видео', initialOpen: true },
          el( ToggleControl, {
            label: 'Зациклить видео',
            checked: a.videoLoop !== false,
            onChange: ( v ) => set( { videoLoop: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Без звука',
            checked: a.videoMuted !== false,
            onChange: ( v ) => set( { videoMuted: !! v } )
          } ),
          el( ToggleControl, {
            label: 'Показать кнопку звука',
            checked: typeof a.showSoundButton === 'boolean' ? a.showSoundButton : true,
            onChange: ( v ) => set( { showSoundButton: !! v } ),
            help: 'Кнопка переключения звука в углу'
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
            label: 'Затемнение видео',
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
        el( 'h3', null, 'Видео Hero слайды' ),
        ( a.slides || [] ).length === 0 && el(
          'p',
          { style: { color: '#666', fontStyle: 'italic' } },
          'Добавьте видео слайды для начала работы'
        ),
        el(
          'div',
          { className: 'video-hero-slides-list' },
          ( a.slides || [] ).map( ( s, i ) =>
            el(
              'div',
              { className: 'video-hero-slide-item', key: i },
              el(
                'div',
                { className: 'video-hero-slide-preview' },
                ( s.desktopPoster || s.poster )
                  ? el( 'img', { src: s.desktopPoster || s.poster, alt: '' } )
                  : el( 'div', { className: 'video-hero-no-poster' }, '🎬')
              ),
              el(
                'div',
                { className: 'video-hero-slide-meta' },
                el( 'strong', null, s.heading || 'Без заголовка' ),
                el( 'p', { style: { fontSize: '12px', margin: '5px 0' } }, s.text || 'Нет описания' ),
                s.desktopVideoMp4 && el( 'span', { style: { fontSize: '11px', color: '#666' } }, '🖥 Desktop: MP4' ),
                s.desktopVideoWebm && el( 'span', { style: { fontSize: '11px', color: '#666' } }, ' + WebM' ),
                el( 'br' ),
                s.mobileVideoMp4 && el( 'span', { style: { fontSize: '11px', color: '#666' } }, '📱 Mobile: MP4' ),
                s.mobileVideoWebm && el( 'span', { style: { fontSize: '11px', color: '#666' } }, ' + WebM' )
              ),
              el(
                'div',
                { className: 'video-hero-slide-actions' },
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
            'Добавить видео слайд'
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
        className: 'video-hero-block',
        style: {
          '--video-hero-min-height': ( a.minHeight || 600 ) + 'px',
          '--video-hero-overlay': `${a.overlayOpacity || 0.3}`,
          '--video-hero-text-color': a.textColor || '#ffffff',
          '--video-hero-content-align': a.contentAlign || 'center',
          '--video-hero-content-vertical': a.contentVerticalAlign || 'center'
        },
        'data-config': JSON.stringify( {
          autoplay: !! ( a.autoplay !== false ),
          autoplayDelay: a.autoplayDelay || 5000,
          speed: a.speed || 1000,
          loop: !! ( a.loop !== false ),
          pagination: !! ( a.pagination !== false ),
          navigation: !! ( a.navigation !== false ),
          videoLoop: !! ( a.videoLoop !== false ),
          videoMuted: !! ( a.videoMuted !== false )
        } )
      } );

      // Only show swiper if there are multiple slides
      const useSwiper = ( a.slides || [] ).length > 1;

      return el(
        'div',
        bp,
        el(
          'div',
          { className: useSwiper ? 'swiper video-hero-swiper' : 'video-hero-single' },
          el(
            'div',
            { className: useSwiper ? 'swiper-wrapper' : '' },
            ( a.slides || [] ).map( ( s, i ) =>
              el(
                'div',
                { className: useSwiper ? 'swiper-slide' : 'video-hero-slide', key: i },
                el(
                  'div',
                  { className: 'video-hero-video-container' },
                  // Render video or iframe based on type
                  ( s.videoType === 'youtube' && s.youtubeUrl ) ? el( 'iframe', {
                    className: 'video-hero-iframe',
                    src: getYouTubeEmbedUrl( s.youtubeUrl ),
                    frameBorder: '0',
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    allowFullScreen: true
                  } ) : ( s.videoType === 'vimeo' && s.vimeoUrl ) ? el( 'iframe', {
                    className: 'video-hero-iframe',
                    src: getVimeoEmbedUrl( s.vimeoUrl ),
                    frameBorder: '0',
                    allow: 'autoplay; fullscreen; picture-in-picture',
                    allowFullScreen: true
                  } ) : el(
                    'video',
                    {
                      className: 'video-hero-video',
                      loop: a.videoLoop !== false,
                      muted: a.videoMuted !== false,
                      playsInline: true,
                      autoPlay: true,
                      preload: 'auto',
                      poster: s.desktopPoster || s.poster || undefined,
                      'data-desktop-mp4': s.desktopVideoMp4 || '',
                      'data-desktop-webm': s.desktopVideoWebm || '',
                      'data-mobile-mp4': s.mobileVideoMp4 || '',
                      'data-mobile-webm': s.mobileVideoWebm || '',
                      'data-desktop-poster': s.desktopPoster || s.poster || '',
                      'data-mobile-poster': s.mobilePoster || ''
                    },
                    s.desktopVideoWebm && el( 'source', { src: s.desktopVideoWebm, type: 'video/webm' } ),
                    s.desktopVideoMp4 && el( 'source', { src: s.desktopVideoMp4, type: 'video/mp4' } )
                  ),
                  el( 'div', { className: 'video-hero-overlay' } ),
                  el(
                    'div',
                    { className: 'video-hero-content' },
                    s.heading && el( 'h2', { className: 'video-hero-heading' }, s.heading ),
                    s.text && el( 'p', { className: 'video-hero-text' }, s.text ),
                    s.buttonText && s.buttonUrl && el(
                      'a',
                      {
                        className: 'video-hero-button',
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
          // Sound control button
          a.showSoundButton !== false && el(
            'button',
            {
              className: 'video-hero-sound-button',
              'aria-label': 'Toggle sound',
              type: 'button'
            },
            el(
              'svg',
              {
                className: 'sound-icon sound-on',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              },
              el( 'polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' } ),
              el( 'path', { d: 'M15.54 8.46a5 5 0 0 1 0 7.07' } ),
              el( 'path', { d: 'M19.07 4.93a10 10 0 0 1 0 14.14' } )
            ),
            el(
              'svg',
              {
                className: 'sound-icon sound-off',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '2',
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              },
              el( 'polygon', { points: '11 5 6 9 2 9 2 15 6 15 11 19 11 5' } ),
              el( 'line', { x1: '23', y1: '9', x2: '17', y2: '15' } ),
              el( 'line', { x1: '17', y1: '9', x2: '23', y2: '15' } )
            )
          ),
          // Scroll down button
          a.showScrollButton !== false && el(
            'button',
            {
              className: 'video-hero-scroll-button',
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
