/* eslint-disable no-undef */
(function (wp) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } = be;
  const { Button, PanelBody, RangeControl, ToggleControl, SelectControl } = wp.components;

  const SIZES = [
    { label: 'thumbnail', value: 'thumbnail' },
    { label: 'medium', value: 'medium' },
    { label: 'medium_large', value: 'medium_large' },
    { label: 'large', value: 'large' },
    { label: 'full', value: 'full' }
  ];
  const RATIOS = [
    { label: '1:1 (square)', value: '1/1' },
    { label: '4:3', value: '4/3' },
    { label: '3:2', value: '3/2' },
    { label: '16:9', value: '16/9' }
  ];

  function bySize(media, slug) {
    const sizes = (media && (media.sizes || (media.media_details && media.media_details.sizes))) || {};
    if (sizes && sizes[slug] && sizes[slug].url) return sizes[slug].url;
    if (media && media.sizes && media.sizes[slug] && media.sizes[slug].url) return media.sizes[slug].url;
    if (media && media.url) return media.url;
    return '';
  }

  function imgObjFromMedia(m) {
    const title = (m && (m.title && (m.title.rendered || m.title))) || m.title || '';
    const alt = (m && (m.alt || m.alt_text)) || '';
    return {
      id: m.id,
      alt: alt || title || '',
      title: title || '',
      urlsBySize: {
        thumbnail: bySize(m, 'thumbnail'),
        medium: bySize(m, 'medium'),
        medium_large: bySize(m, 'medium_large'),
        large: bySize(m, 'large'),
        full: bySize(m, 'full') || (m.url || '')
      }
    };
  }

  registerBlockType('tg/fbmp-gallery', {
    edit: function (props) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [active, setActive] = useState(-1);
      const [dragIndex, setDragIndex] = useState(null);

      const blockProps = useBlockProps({
        className: 'tg-fbmp tg-fbmp--editor' + (a.cropFit ? ' tg-fbmp--crop' : ''),
        style: {
          '--fbmp-columns': a.columns || 3,
          '--fbmp-gap': (a.gap || 12) + 'px',
          '--fbmp-radius': (a.radius || 0) + 'px',
          '--fbmp-aspect': a.cropFit ? (a.cropRatio || '1/1').replace('/', ' / ') : undefined
        }
      });

      const onSelectAll = (items) => set({ images: (items || []).map(imgObjFromMedia) });
      const replaceAt = (i, media) => {
        const s=(a.images||[]).slice(); s[i]=imgObjFromMedia(media); set({ images:s }); setActive(-1);
      };
      const removeAt = (i) => {
        const s=(a.images||[]).slice(); s.splice(i,1); set({ images:s }); setActive(-1);
      };
      const move = (from,to)=>{ const s=(a.images||[]).slice(); if(to<0||to>=s.length)return; const [x]=s.splice(from,1); s.splice(to,0,x); set({ images:s }); };

      // Drag & Drop handlers
      const handleDragStart = (e, index) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget);
      };

      const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragIndex === null || dragIndex === index) return;

        // Визуальная индикация: добавляем класс
        const target = e.currentTarget;
        if (dragIndex < index) {
          target.classList.add('drag-over-after');
          target.classList.remove('drag-over-before');
        } else {
          target.classList.add('drag-over-before');
          target.classList.remove('drag-over-after');
        }
      };

      const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over-before', 'drag-over-after');
      };

      const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over-before', 'drag-over-after');

        if (dragIndex === null || dragIndex === dropIndex) return;

        const newImages = [...(a.images || [])];
        const [movedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, movedItem);

        set({ images: newImages });
        setDragIndex(null);
      };

      const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        setDragIndex(null);
        // Очистка всех drag-over классов
        document.querySelectorAll('.drag-over-before, .drag-over-after').forEach(el => {
          el.classList.remove('drag-over-before', 'drag-over-after');
        });
      };

      return el(Fragment, null,
        el(InspectorControls, null,
          el(PanelBody, { title: 'Макет', initialOpen: true },
            el(ToggleControl, { label:'Включить Masonry (desandro)', checked:!!a.useMasonry, onChange:v=>set({useMasonry:!!v}) }),
            el(RangeControl, { label:'Колонок (desktop)', min:1, max:8, value:a.columns, onChange:v=>set({columns:parseInt(v||0,10)||3}) }),
            el(RangeControl, { label:'Колонок (tablet)',  min:1, max:6, value:a.columnsTablet, onChange:v=>set({columnsTablet:parseInt(v||0,10)||2}) }),
            el(RangeControl, { label:'Колонок (mobile)',  min:1, max:4, value:a.columnsMobile, onChange:v=>set({columnsMobile:parseInt(v||0,10)||1}) }),
            el(RangeControl, { label:'Gap (px)', min:0, max:48, value:a.gap, onChange:v=>set({gap:parseInt(v||0,10)||12}) }),
            el(RangeControl, { label:'Скругление (px)', min:0, max:32, value:a.radius, onChange:v=>set({radius:parseInt(v||0,10)||0}) }),
          ),
          el(PanelBody, { title: 'Изображения', initialOpen: true },
            el(SelectControl, { label:'Thumb (превью)', value:a.thumbSize, options:SIZES, onChange:v=>set({thumbSize:v}) }),
            el(SelectControl, { label:'Full (лайтбокс)', value:a.fullSize, options:SIZES, onChange:v=>set({fullSize:v}) }),
            el(ToggleControl, { label:'Подписи в Fancybox (Title/Alt из медиатеки)', checked:!!a.showCaptions, onChange:v=>set({showCaptions:!!v}) }),
            el(ToggleControl, { label:'Legacy: href="javascript:" + data-href', checked:!!a.legacyHref, onChange:v=>set({legacyHref:!!v}) }),
            el(ToggleControl, { label:'Crop images to fit (равномерно)', checked:!!a.cropFit, onChange:v=>set({cropFit:!!v}) }),
            !!a.cropFit && el(SelectControl, { label:'Соотношение сторон', value:a.cropRatio, options:[{label:'1:1',value:'1/1'},{label:'4:3',value:'4/3'},{label:'3:2',value:'3/2'},{label:'16:9',value:'16/9'}], onChange:v=>set({cropRatio:v}) })
          ),
          el(PanelBody, { title: 'Производительность', initialOpen: false },
            el(ToggleControl, { label:'Masonry только на Desktop (>=1024px)', checked:!!a.perfDesktopOnly, onChange:v=>set({perfDesktopOnly:!!v}) }),
            el(RangeControl, { label:'Включать Masonry, если изображений >', min:0, max:40, value:a.perfMinItems, onChange:v=>set({perfMinItems:parseInt(v||0,10)||0}) })
          )
        ),
        el('div', blockProps,
          el('div', { className:'tg-fbmp__grid','data-cols-tablet':a.columnsTablet,'data-cols-mobile':a.columnsMobile},
            (a.images || []).map((img, i) => {
              const title = (img && img.title) || '';
              const alt   = (img && img.alt) || '';
              const thumb = (img.urlsBySize && (img.urlsBySize[a.thumbSize] || img.urlsBySize.medium)) || (img.urlsBySize && img.urlsBySize.full) || '';
              const full  = (img.urlsBySize && (img.urlsBySize[a.fullSize]  || img.urlsBySize.full)) || '';

              const aProps = a.legacyHref
                ? { className:'tg-fbmp__item', href:'#', 'data-href': full, onClick:(e)=>{ e.preventDefault(); setActive(i); } }
                : { className:'tg-fbmp__item', href:'#', onClick:(e)=>{ e.preventDefault(); setActive(i); } };

              return el('div', {
                className: 'tg-fbmp__itemwrap' + (active===i?' is-active':'') + (dragIndex === i ? ' dragging' : ''),
                key:'it'+i,
                draggable: true,
                onDragStart: (e) => handleDragStart(e, i),
                onDragOver: (e) => handleDragOver(e, i),
                onDragLeave: handleDragLeave,
                onDrop: (e) => handleDrop(e, i),
                onDragEnd: handleDragEnd
              },
                el('a', aProps,
                  el('img', { src: thumb, alt: alt || '', title: title, loading:'lazy', decoding:'async' })
                ),
                el('div', { className:'tg-fbmp__controls' },
                  el('div', { className:'tg-fbmp__controls-inner' },
                    el(Button, { className:'tg-fbmp__btn-left', onClick:(e)=>{ e.preventDefault(); move(i,i-1); }, disabled:i===0, title:'Переместить влево' }, '←'),
                    el(Button, { className:'tg-fbmp__btn-right', onClick:(e)=>{ e.preventDefault(); move(i,i+1); }, disabled:i===a.images.length-1, title:'Переместить вправо' }, '→'),
                    el(MediaUploadCheck, null,
                      el(MediaUpload, {
                        allowedTypes:['image'], multiple:false,
                        onSelect: (media)=> replaceAt(i, media),
                        render: ({open})=> el(Button, { className:'tg-fbmp__btn-replace', onClick: open, title:'Заменить' }, '🔄')
                      })
                    ),
                    el(Button, { className:'tg-fbmp__btn-delete', isDestructive:true, onClick:(e)=>{ e.preventDefault(); removeAt(i); }, title:'Удалить' }, '✖')
                  )
                )
              );
            })
          ),
          el('div', { className:'tg-fbmp__toolbar' },
            el(MediaUploadCheck, null,
              el(MediaUpload, {
                gallery:true, multiple:true, addToGallery:true, allowedTypes:['image'],
                value:(a.images||[]).map(x=>x.id),
                onSelect:onSelectAll,
                render:({open})=> el(Button, { variant:'primary', onClick: open }, (a.images&&a.images.length)?'Заменить все изображения':'Выбрать изображения')
              })
            )
          )
        )
      );
    },

    save: function (props) {
      const a = props.attributes;
      const blockProps = (wp.blockEditor || wp.editor).useBlockProps.save({
        className:'tg-fbmp' + (a.cropFit ? ' tg-fbmp--crop' : ''),
        style:{
          '--fbmp-columns': a.columns || 3,
          '--fbmp-gap': (a.gap || 12) + 'px',
          '--fbmp-radius': (a.radius || 0) + 'px',
          '--fbmp-aspect': a.cropFit ? (a.cropRatio || '1/1').replace('/', ' / ') : undefined
        },
        'data-cols-tablet': a.columnsTablet || 2,
        'data-cols-mobile': a.columnsMobile || 1,
        'data-use-masonry': a.useMasonry ? '1':'0',
        'data-msnry-fit': a.msnryFitWidth ? '1':'0',
        'data-msnry-horder': a.msnryHOrder ? '1':'0',
        'data-msnry-percent': a.msnryPercent ? '1':'0',
        'data-msnry-gutter': a.msnryGutter || 0,
        'data-msnry-transition': a.msnryTransition || '0.2s',
        'data-show-captions': a.showCaptions ? '1':'0',
        'data-legacy-href': a.legacyHref ? '1':'0',
        'data-perf-desktop': a.perfDesktopOnly ? '1':'0',
        'data-perf-minitems': a.perfMinItems || 0
      });

      function thumbOf(img){ return (img.urlsBySize && (img.urlsBySize[a.thumbSize] || img.urlsBySize.medium)) || (img.urlsBySize && img.urlsBySize.full) || ''; }
      function fullOf(img){  return (img.urlsBySize && (img.urlsBySize[a.fullSize]  || img.urlsBySize.full)) || ''; }
      function titleOf(img){ return (img && img.title) || ''; }
      function altOf(img){   return (img && img.alt)   || ''; }

      return el('div', blockProps,
        el('div', { className:'tg-fbmp__grid' },
          (a.images || []).map((img,i)=>
            el('a',
              (function(){
                const title = titleOf(img);
                const caption = a.showCaptions ? (title || altOf(img)) : '';
                const base = { className:'tg-fbmp__item', 'data-caption': caption, title: title };
                return a.legacyHref
                  ? Object.assign(base, { href:'javascript:', 'data-href': fullOf(img) })
                  : Object.assign(base, { href: fullOf(img) });
              })(),
              el('img', { src: thumbOf(img), alt: altOf(img), title: titleOf(img), loading:'lazy', decoding:'async' }),
              el('div', { className:'tg-fbmp__hover' })
            )
          )
        )
      );
    }
  });
})(window.wp);
