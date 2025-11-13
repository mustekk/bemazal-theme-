(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { createElement: el, Fragment } = wp.element;
    const { RichText, MediaUpload, InspectorControls } = wp.blockEditor || wp.editor;
    const { PanelBody, Button, SelectControl, TextControl, Placeholder, __experimentalUnitControl } = wp.components;

    function buildSizeOptions(sizesMap) {
        const human = {
            thumbnail: 'Thumbnail',
            medium: 'Medium',
            medium_large: 'Medium Large',
            large: 'Large',
            full: 'Full Size',
        };
        const keys = sizesMap ? Object.keys(sizesMap) : [];
        const uniq = {};
        const opts = [];
        // ensure full is present
        if (!keys.includes('full')) keys.push('full');
        keys.forEach(function (k) {
            if (uniq[k]) return;
            uniq[k] = true;
            opts.push({ label: human[k] || k, value: k });
        });
        return opts;
    }

    registerBlockType('bemazal/one-v-one', {
        edit: function (props) {
            const { attributes, setAttributes, className } = props;
            const { mediaID, mediaAlt, mediaURL, mediaSize, mediaSizes, aspectRatio, imgWidth, imgHeight, title, text, buttonText, buttonUrl } = attributes;

            function onSelectMedia(media) {
                // For images, WP returns sizes in media.sizes or media.media_details.sizes
                const sizes = media.sizes || (media.media_details && media.media_details.sizes) || {};
                const map = {};
                Object.keys(sizes).forEach(function (k) {
                    map[k] = sizes[k].url || sizes[k].source_url || '';
                });
                map['full'] = media.url || media.source_url || '';

                const nextSize = mediaSize && map[mediaSize] ? mediaSize : 'full';
                const nextURL  = map[nextSize] || media.url || '';

                setAttributes({
                    mediaID: media.id,
                    mediaAlt: media.alt || media.alt_text || '',
                    mediaSizes: map,
                    mediaSize: nextSize,
                    mediaURL: nextURL,
                });
            }

            function changeSize(sizeSlug) {
                const nextURL = (attributes.mediaSizes && attributes.mediaSizes[sizeSlug]) ? attributes.mediaSizes[sizeSlug] : attributes.mediaURL;
                setAttributes({ mediaSize: sizeSlug, mediaURL: nextURL });
            }

            const ratioOptions = [
                { label: 'Original', value: 'original' },
                { label: '1:1',     value: '1:1' },
                { label: '4:3',     value: '4:3' },
                { label: '3:2',     value: '3:2' },
                { label: '16:9',    value: '16:9' },
            ];

            const aspectStyle = {};
            if (aspectRatio && aspectRatio !== 'original') {
                aspectStyle.aspectRatio = aspectRatio.replace(':','/');
            }

            const imgStyle = {};
            if (imgWidth)  imgStyle.width  = (parseInt(imgWidth,10) || 0)  + 'px';
            if (imgHeight) imgStyle.height = (parseInt(imgHeight,10) || 0) + 'px';

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    el(
                        PanelBody,
                        { title: 'Изображение', initialOpen: true },
                        mediaID ? el(SelectControl, {
                            label: 'Resolution',
                            value: mediaSize || 'full',
                            options: buildSizeOptions(mediaSizes),
                            onChange: changeSize,
                        }) : el('div', { style: { color: '#666' } }, 'Выберите изображение, чтобы задать Resolution.'),
                        el(SelectControl, {
                            label: 'Aspect Ratio',
                            value: aspectRatio || 'original',
                            options: ratioOptions,
                            onChange: (v) => setAttributes({ aspectRatio: v }),
                        }),
                        el(TextControl, {
                            label: 'Width (px)',
                            type: 'number',
                            value: imgWidth || '',
                            placeholder: 'Auto',
                            onChange: (v) => setAttributes({ imgWidth: v }),
                        }),
                        el(TextControl, {
                            label: 'Height (px)',
                            type: 'number',
                            value: imgHeight || '',
                            placeholder: 'Auto',
                            onChange: (v) => setAttributes({ imgHeight: v }),
                        }),
                    ),
                    el(
                        PanelBody,
                        { title: 'Кнопка', initialOpen: false },
                        el(TextControl, {
                            label: 'Текст кнопки',
                            value: buttonText || '',
                            onChange: (v) => setAttributes({ buttonText: v })
                        }),
                        el(TextControl, {
                            label: 'Ссылка (URL)',
                            value: buttonUrl || '',
                            onChange: (v) => setAttributes({ buttonUrl: v })
                        })
                    )
                ),
                el(
                    'div',
                    { className: 'bemazal-1v1 is-matrix rel no-padding ' + (className || '') },
                    el(
                        'div',
                        { className: 'col-8 left-align' },
                        el(
                            'div',
                            { className: 'item resp-img', style: aspectStyle },
                            mediaURL
                                ? el('img', { src: mediaURL, alt: mediaAlt || '', style: imgStyle })
                                : el(
                                    Placeholder,
                                    { label: 'Изображение' },
                                    el(MediaUpload, {
                                        onSelect: onSelectMedia,
                                        allowedTypes: ['image'],
                                        value: mediaID,
                                        render: ({ open }) => el(Button, { onClick: open, isSecondary: true }, 'Выбрать изображение')
                                    })
                                  )
                        )
                    ),
                    el(
                        'div',
                        { className: 'col-6 right-align' },
                        el(
                            'div',
                            { className: 'hs-description bg-white has-shadow add-20' },
                            el(RichText, {
                                tagName: 'h3',
                                className: 'weight-400',
                                placeholder: 'Заголовок…',
                                value: title,
                                onChange: (v) => setAttributes({ title: v })
                            }),
                            el(RichText, {
                                tagName: 'p',
                                className: 'size-15',
                                placeholder: 'Текст…',
                                value: text,
                                onChange: (v) => setAttributes({ text: v })
                            }),
                            el('br'),
                            el(
                                'a',
                                { className: 'hs-button ghost-dark is-outlined weight-400', href: buttonUrl || '#', onClick: (e) => e.preventDefault() },
                                buttonText || 'למעבר'
                            )
                        )
                    )
                )
            );
        },
        save: function () { return null; } // динамический блок
    });
})(window.wp);
