/* eslint-disable no-undef */
(function(wp){
  const { createElement: el, Fragment } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } = be;
  const { Button, PanelBody, SelectControl, RangeControl, ToggleControl } = wp.components;

  function getImageSizes(){
    try{
      const sel = wp.data && (wp.data.select('core/block-editor') || wp.data.select('core/editor'));
      const settings = sel && sel.getSettings ? sel.getSettings() : null;
      const sizes = (settings && settings.imageSizes) || [];
      if (sizes && sizes.length){
        return sizes.map(s => ({ label: s.name || s.slug, value: s.slug }));
      }
    }catch(e){}
    return [
      { label: 'thumbnail', value: 'thumbnail' },
      { label: 'medium', value: 'medium' },
      { label: 'medium_large', value: 'medium_large' },
      { label: 'large', value: 'large' },
      { label: 'full', value: 'full' }
    ];
  }
  function bySize(m, slug){
    const sizes = (m && (m.sizes || (m.media_details && m.media_details.sizes))) || {};
    if (sizes && sizes[slug] && sizes[slug].url) return sizes[slug].url;
    if (m && m.sizes && m.sizes[slug] && m.sizes[slug].url) return m.sizes[slug].url;
    return m && m.url ? m.url : '';
  }
  function imgObjFromMedia(m){
    const title = (m && (m.title && (m.title.rendered||m.title))) || m.title || '';
    const alt   = (m && (m.alt || m.alt_text)) || '';
    return {
      id: m.id,
      alt: alt || title || '',
      title: title || '',
      urlsBySize: {
        thumbnail: bySize(m, 'thumbnail'),
        medium: bySize(m, 'medium') || bySize(m, 'medium_large') || bySize(m, 'large') || bySize(m, 'full'),
        medium_large: bySize(m, 'medium_large'),
        large: bySize(m, 'large'),
        full: bySize(m, 'full') || (m.url||'')
      }
    };
  }

  registerBlockType('tg/thumbs-gallery', {
    edit: function(props){
      const a = props.attributes;
      const set = props.setAttributes;

      const sizeOptions = getImageSizes();

      const blockProps = useBlockProps({
        className: 'tg-thumbs-gallery tg-thumbs-gallery--editor',
        style: {
          '--tg-max-w': ((a.maxW||700)+'px'),
          // expose thumbnail size as CSS variable for editor preview sizing
          '--tg-thumb-size': ((a.thumbSizePx||50)+'px')
        }
      });

      const onSelect = (items)=> set({ images: (items||[]).map(imgObjFromMedia) });
      const removeAt = (i)=>{ const s=(a.images||[]).slice(); s.splice(i,1); set({images:s}); };
      const move = (from,to)=>{ const s=(a.images||[]).slice(); if(to<0||to>=s.length)return; const [x]=s.splice(from,1); s.splice(to,0,x); set({images:s}); };
      const replaceAt = (i,m)=>{ const s=(a.images||[]).slice(); s[i]=imgObjFromMedia(m); set({images:s}); };

      /*
       * Build the editing interface for the gallery.
       *
       * In the editor we display the currently selected images as a grid of
       * thumbnails beneath a large preview. Each thumb has a single delete
       * button (a red ×) overlayed in the top right corner. A single
       * “Replace images” button below allows users to open the media
       * library and choose a new set of images. All other actions (move
       * up/down, replace individual) are hidden for a cleaner UI.
       */
      return el(Fragment, null,
        // Inspector panels
        el(InspectorControls, null,
          el(PanelBody, { title:'Размеры изображений', initialOpen:true },
            el(SelectControl, { label:'Main (основной слайд)', value:a.mainSize||'medium', options:sizeOptions, onChange:v=>set({mainSize:v}) }),
            el(SelectControl, { label:'Thumbs (миниатюры)', value:a.thumbSize||'thumbnail', options:sizeOptions, onChange:v=>set({thumbSize:v}) }),
            el(SelectControl, { label:'Lightbox (href)', value:a.linkSize||'full', options:sizeOptions, onChange:v=>set({linkSize:v}) })
          ),
          el(PanelBody, { title:'Автопрокрутка', initialOpen:false },
            el(ToggleControl, { label:'Autoplay', checked:!!a.autoplay, onChange:v=>set({autoplay:!!v}) }),
            el(RangeControl, { label:'Задержка (мс)', min:1000, max:10000, step:500, value:a.autoplayDelay||3000, onChange:v=>set({autoplayDelay:parseInt(v||0,10)||3000}), disabled:!a.autoplay }),
            el(ToggleControl, { label:'Пауза при наведении', checked:!!a.pauseOnHover, onChange:v=>set({pauseOnHover:!!v}), disabled:!a.autoplay }),
            el(ToggleControl, { label:'Loop', checked:!!a.loop, onChange:v=>set({loop:!!v}) })
          ),
        el(PanelBody, { title:'Макет', initialOpen:false },
            el(RangeControl, { label:'Макс. ширина (px)', min:320, max:1920, step:10, value:a.maxW||700, onChange:v=>set({maxW:parseInt(v||0,10)||700}) }),
            el(RangeControl, { label:'Макс. высота (px)', min:0, max:1200, step:10, value:a.maxH||0, onChange:v=>set({maxH:parseInt(v||0,10)||0}) }),
            el(RangeControl, { label:'Размер превью (px)', min:30, max:200, step:2, value:a.thumbSizePx||50, onChange:v=>set({ thumbSizePx: parseInt(v||0,10) || 50 }) }),
            el(SelectControl, { label:'Соотношение сторон', value:a.ratio||'auto', options:[{label:'Авто',value:'auto'},{label:'16:9',value:'16/9'},{label:'4:3',value:'4/3'},{label:'3:2',value:'3/2'},{label:'1:1',value:'1/1'}], onChange:v=>set({ratio:v}) }),
            el(ToggleControl, { label:'Показывать стрелки навигации', checked:!!a.nav, onChange:v=>set({nav:!!v}) })
          )
        ),
        // Block content wrapper
        el('div', blockProps,
          // Main preview area – reuse the same structure as on the front end
          el('div', { className:'tg-thumbs-gallery__main' },
            el('div', { className:'swiper' },
              el('div', { className:'swiper-wrapper' },
                (a.images||[]).map((img,i)=>{
                  const mainSrc = (img.urlsBySize && (img.urlsBySize[a.mainSize||'medium'] || img.urlsBySize.medium || img.urlsBySize.full)) || '';
                  const cap = img.title || img.alt || '';
                  return el('div', { className:'swiper-slide', key:'m'+i },
                    el('a', { className:'tg-thumbs-gallery__link', href:'#', 'data-caption':cap, onClick:(e)=>{ e.preventDefault(); e.stopPropagation(); } },
                      el('img', { src: mainSrc, alt: img.alt||'', loading:'lazy', decoding:'async' })
                    )
                  );
                })
              ),
              a.nav ? el('div', { className:'tg-thumbs-gallery__btn tg-thumbs-gallery__btn--prev' }) : null,
              a.nav ? el('div', { className:'tg-thumbs-gallery__btn tg-thumbs-gallery__btn--next' }) : null
            )
          ),
          // Thumbnails preview area for editor only (simple grid of squares with remove icon)
          el('div', { className:'tg-thumbs-gallery__editorbar' },
            (a.images&&a.images.length) ? el('div', { className:'tg-thumbs-gallery__thumbslist' },
              a.images.map((img,i)=>{
                const th = (img.urlsBySize && (img.urlsBySize[a.thumbSize||'thumbnail'] || img.urlsBySize.thumbnail || img.urlsBySize.medium || img.urlsBySize.full)) || '';
                return el('div', { className:'tg-admin-thumb', key:'ad'+i },
                  el('img', { src: th, alt: img.alt||'' }),
                  el('button', { className:'tg-admin-remove', type:'button', onClick:()=>removeAt(i) }, '\u2715')
                );
              })
            ) : null,
            // Button to replace images using Media Library
            el(MediaUploadCheck, null,
              el(MediaUpload, {
                gallery:true, multiple:true, addToGallery:true, allowedTypes:['image'],
                value:(a.images||[]).map(x=>x.id),
                onSelect:onSelect,
                render:({open})=> el(Button, { variant:'primary', onClick: open }, (a.images&&a.images.length)?'Заменить изображения':'Выбрать изображения')
              })
            )
          )
        )
      );
    },

    save: function(props){
      const a = props.attributes;
      const blockProps = (wp.blockEditor||wp.editor).useBlockProps.save({
        className:'tg-thumbs-gallery',
        style:{
          '--tg-max-w': ((a.maxW||700)+'px'),
          '--tg-gap': ((a.gap||8)+'px'),
          '--tg-radius': ((a.radius||12)+'px'),
          '--tg-max-h': ((a.maxH||0)?(a.maxH+'px'):'none'),
          '--tg-aspect': (a.ratio&&a.ratio!=='auto'?a.ratio:'auto'),
          '--tg-thumb-size': ((a.thumbSizePx||50)+'px')
        },
        'data-autoplay': a.autoplay ? '1':'0',
        'data-autoplay-delay': a.autoplayDelay || 3000,
        'data-loop': a.loop ? '1':'0',
        'data-pause-hover': a.pauseOnHover ? '1':'0'
      });

      function urlOf(img, slug, fallback){
        if (!img || !img.urlsBySize) return img?.url || '';
        return img.urlsBySize[slug] || img.urlsBySize[fallback] || img.urlsBySize.full || img.url || '';
      }
      function capOf(img){ return (img && (img.title || img.alt)) || ''; }

      return el('div', blockProps,
        el('div', { className:'tg-thumbs-gallery__main' },
          el('div', { className:'swiper' },
            el('div', { className:'swiper-wrapper' },
              (a.images||[]).map((img,i)=>
                el('div', { className:'swiper-slide', key:'m'+i },
                  el('a', { className:'tg-thumbs-gallery__link',
                            href: urlOf(img, a.linkSize||'full', 'full'),
                            'data-caption': capOf(img) },
                    el('img', { src: urlOf(img, a.mainSize||'medium', 'medium'),
                                alt: img.alt||'',
                                loading:'lazy', decoding:'async' })
                  )
                )
              )
            ),
            a.nav ? el('div', { className:'tg-thumbs-gallery__btn tg-thumbs-gallery__btn--prev' }) : null,
            a.nav ? el('div', { className:'tg-thumbs-gallery__btn tg-thumbs-gallery__btn--next' }) : null
          )
        ),
        el('div', { className:'tg-thumbs-gallery__thumbs' },
          el('div', { className:'swiper' },
            el('div', { className:'swiper-wrapper' },
              (a.images||[]).map((img,i)=>
                el('div', { className:'swiper-slide', key:'t'+i },
                  el('img', { src: urlOf(img, a.thumbSize||'thumbnail', 'thumbnail'), alt: img.alt||'', loading:'lazy', decoding:'async' })
                )
              )
            )
          )
        )
      );
    }
  });
})(window.wp);