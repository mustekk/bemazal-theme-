(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { createElement: el, Fragment } = wp.element;
    const { RichText, MediaUpload, InspectorControls, MediaUploadCheck } = wp.blockEditor || wp.editor;
    const { PanelBody, Button, SelectControl, TextControl, Placeholder, ToggleControl, RangeControl, ToolbarGroup, ToolbarButton } = wp.components;
    const { __ } = wp.i18n;

    function buildSizeOptions(sizesMap) {
        const human = {
            thumbnail: 'Миниатюра',
            medium: 'Средний',
            medium_large: 'Средний большой',
            large: 'Большой',
            full: 'Полный размер',
        };
        const keys = sizesMap ? Object.keys(sizesMap) : [];
        const uniq = {};
        const opts = [];
        if (!keys.includes('full')) keys.push('full');
        keys.forEach(function (k) {
            if (uniq[k]) return;
            uniq[k] = true;
            opts.push({ label: human[k] || k, value: k });
        });
        return opts;
    }

    registerBlockType('bemazal/image-card', {
        edit: function (props) {
            const { attributes, setAttributes, className } = props;
            const {
                mediaID, mediaAlt, mediaURL, mediaSize, mediaSizes,
                aspectRatio, imgWidth, imgHeight,
                title, text, buttonText, buttonUrl, buttonTarget,
                textAlign, cardOverlap
            } = attributes;

            function onSelectMedia(media) {
                const sizes = media.sizes || (media.media_details && media.media_details.sizes) || {};
                const map = {};
                Object.keys(sizes).forEach(function (k) {
                    map[k] = sizes[k].url || sizes[k].source_url || '';
                });
                map['full'] = media.url || media.source_url || '';

                const nextSize = mediaSize && map[mediaSize] ? mediaSize : 'full';
                const nextURL = map[nextSize] || media.url || '';

                setAttributes({
                    mediaID: media.id,
                    mediaAlt: media.alt || media.alt_text || '',
                    mediaSizes: map,
                    mediaSize: nextSize,
                    mediaURL: nextURL,
                });
            }

            function changeSize(sizeSlug) {
                const nextURL = (attributes.mediaSizes && attributes.mediaSizes[sizeSlug])
                    ? attributes.mediaSizes[sizeSlug]
                    : attributes.mediaURL;
                setAttributes({ mediaSize: sizeSlug, mediaURL: nextURL });
            }

            const ratioOptions = [
                { label: 'Оригинал', value: 'original' },
                { label: '1:1 (Квадрат)', value: '1:1' },
                { label: '4:3 (Стандарт)', value: '4:3' },
                { label: '3:2 (Классика)', value: '3:2' },
                { label: '16:9 (Широкий)', value: '16:9' },
            ];

            const aspectStyle = {};
            if (aspectRatio && aspectRatio !== 'original') {
                aspectStyle.aspectRatio = aspectRatio.replace(':', '/');
            }

            const imgStyle = {};
            if (imgWidth) imgStyle.width = (parseInt(imgWidth, 10) || 0) + 'px';
            if (imgHeight) imgStyle.height = (parseInt(imgHeight, 10) || 0) + 'px';

            // Определяем стили на основе настроек
            const cardStyle = {
                textAlign: textAlign,
                direction: textAlign === 'right' ? 'rtl' : 'ltr'
            };

            const cardWrapperStyle = {
                marginTop: '-' + (parseInt(cardOverlap) || 80) + 'px'
            };

            return el(
                Fragment,
                null,
                el(
                    InspectorControls,
                    null,
                    // Панель изображения
                    el(
                        PanelBody,
                        { title: '🖼️ Настройки изображения', initialOpen: true },
                        mediaID ? el(
                            Fragment,
                            null,
                            el(
                                'div',
                                { style: { marginBottom: '12px' } },
                                el(
                                    MediaUploadCheck,
                                    null,
                                    el(MediaUpload, {
                                        onSelect: onSelectMedia,
                                        allowedTypes: ['image'],
                                        value: mediaID,
                                        render: ({ open }) => el(
                                            Button,
                                            {
                                                onClick: open,
                                                isSecondary: true,
                                                style: { width: '100%' }
                                            },
                                            'Заменить изображение'
                                        )
                                    })
                                )
                            ),
                            el(SelectControl, {
                                label: 'Разрешение',
                                value: mediaSize || 'full',
                                options: buildSizeOptions(mediaSizes),
                                onChange: changeSize,
                                help: 'Выберите размер изображения'
                            }),
                            el(SelectControl, {
                                label: 'Соотношение сторон',
                                value: aspectRatio || 'original',
                                options: ratioOptions,
                                onChange: (v) => setAttributes({ aspectRatio: v }),
                                help: 'Принудительное соотношение сторон'
                            }),
                            el(TextControl, {
                                label: 'Ширина (px)',
                                type: 'number',
                                value: imgWidth || '',
                                placeholder: 'Авто',
                                onChange: (v) => setAttributes({ imgWidth: v }),
                                help: 'Пользовательская ширина'
                            }),
                            el(TextControl, {
                                label: 'Высота (px)',
                                type: 'number',
                                value: imgHeight || '',
                                placeholder: 'Авто',
                                onChange: (v) => setAttributes({ imgHeight: v }),
                                help: 'Пользовательская высота'
                            })
                        ) : el(
                            'p',
                            { style: { color: '#666', fontSize: '13px' } },
                            'Выберите изображение для настройки параметров'
                        )
                    ),
                    // Панель макета
                    el(
                        PanelBody,
                        { title: '📐 Настройки макета', initialOpen: false },
                        el(RangeControl, {
                            label: 'Наложение карточки (px)',
                            value: parseInt(cardOverlap) || 80,
                            onChange: (v) => setAttributes({ cardOverlap: String(v) }),
                            min: 0,
                            max: 200,
                            step: 10,
                            help: 'Насколько карточка накладывается на изображение сверху (в пикселях)'
                        })
                    ),
                    // Панель контента
                    el(
                        PanelBody,
                        { title: '📝 Настройки контента', initialOpen: false },
                        el(SelectControl, {
                            label: 'Выравнивание текста',
                            value: textAlign || 'right',
                            options: [
                                { label: 'По левому краю', value: 'left' },
                                { label: 'По центру', value: 'center' },
                                { label: 'По правому краю', value: 'right' }
                            ],
                            onChange: (v) => setAttributes({ textAlign: v }),
                            help: 'Выравнивание текста в карточке'
                        })
                    ),
                    // Панель кнопки
                    el(
                        PanelBody,
                        { title: '🔗 Настройки кнопки', initialOpen: false },
                        el(TextControl, {
                            label: 'Текст кнопки',
                            value: buttonText || '',
                            placeholder: 'Введите текст...',
                            onChange: (v) => setAttributes({ buttonText: v })
                        }),
                        el(TextControl, {
                            label: 'Ссылка (URL)',
                            value: buttonUrl || '',
                            placeholder: 'https://...',
                            onChange: (v) => setAttributes({ buttonUrl: v }),
                            type: 'url'
                        }),
                        el(ToggleControl, {
                            label: 'Открывать в новой вкладке',
                            checked: buttonTarget || false,
                            onChange: (v) => setAttributes({ buttonTarget: v }),
                            help: buttonTarget ? 'Ссылка откроется в новой вкладке' : 'Ссылка откроется в той же вкладке'
                        })
                    )
                ),
                el(
                    'div',
                    { className: 'bemazal-image-card ' + (className || '') },
                    el(
                        'div',
                        { className: 'image-wrapper' },
                        el(
                            'div',
                            { className: 'image-container', style: aspectStyle },
                            mediaURL
                                ? el('img', { src: mediaURL, alt: mediaAlt || '', style: imgStyle })
                                : el(
                                    Placeholder,
                                    {
                                        label: 'Изображение',
                                        instructions: 'Выберите изображение из медиатеки или загрузите новое'
                                    },
                                    el(
                                        MediaUploadCheck,
                                        null,
                                        el(MediaUpload, {
                                            onSelect: onSelectMedia,
                                            allowedTypes: ['image'],
                                            value: mediaID,
                                            render: ({ open }) => el(
                                                Button,
                                                { onClick: open, isPrimary: true },
                                                'Выбрать изображение'
                                            )
                                        })
                                    )
                                )
                        )
                    ),
                    el(
                        'div',
                        { className: 'card-wrapper', style: cardWrapperStyle },
                        el(
                            'div',
                            { className: 'card-content', style: cardStyle },
                            el(RichText, {
                                tagName: 'h3',
                                className: 'card-title',
                                placeholder: 'Добавьте заголовок...',
                                value: title,
                                onChange: (v) => setAttributes({ title: v })
                            }),
                            el(RichText, {
                                tagName: 'p',
                                className: 'card-text',
                                placeholder: 'Добавьте описание...',
                                value: text,
                                onChange: (v) => setAttributes({ text: v })
                            }),
                            buttonText ? el(
                                'a',
                                {
                                    className: 'card-button',
                                    href: buttonUrl || '#',
                                    onClick: (e) => e.preventDefault()
                                },
                                buttonText
                            ) : null
                        )
                    )
                )
            );
        },
        save: function () {
            return null; // Динамический блок с серверным рендерингом
        }
    });
})(window.wp);
