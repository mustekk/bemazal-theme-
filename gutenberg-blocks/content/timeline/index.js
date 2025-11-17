/* eslint-disable no-undef */
( function ( wp ) {
  const { createElement: el, Fragment, useState } = wp.element;
  const { registerBlockType } = wp.blocks;
  const be = wp.blockEditor || wp.editor;
  const { useBlockProps, InspectorControls } = be;
  const {
    Button,
    PanelBody,
    RangeControl,
    ToggleControl,
    TextControl,
    TextareaControl,
    SelectControl,
    Modal,
    ColorPicker,
    ColorIndicator
  } = wp.components;

  // Утилита для перемещения элементов в массиве
  function moveItem( arr, from, to ) {
    const a = ( arr || [] ).slice();
    if ( from < 0 || from >= a.length || to < 0 || to >= a.length ) return a;
    const [ x ] = a.splice( from, 1 );
    a.splice( to, 0, x );
    return a;
  }

  // Модальное окно для редактирования элемента Timeline
  function TimelineItemModal( { initial, onSave, onRequestClose } ) {
    const [ item, setItem ] = useState(
      initial || { title: '', description: '' }
    );

    const set = ( patch ) => setItem( Object.assign( {}, item, patch ) );

    return el(
      Modal,
      {
        title: 'Редактировать событие',
        className: 'timeline-modal',
        onRequestClose,
        style: { maxWidth: '600px' }
      },
      el( TextControl, {
        label: 'Заголовок события',
        value: item.title || '',
        onChange: ( v ) => set( { title: v } ),
        placeholder: 'Введите заголовок...'
      } ),
      el( TextareaControl, {
        label: 'Описание события',
        value: item.description || '',
        onChange: ( v ) => set( { description: v } ),
        placeholder: 'Введите описание события...',
        rows: 5,
        help: 'Подробное описание события или этапа'
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

  // Регистрация блока Timeline
  registerBlockType( 'bemazal/timeline', {
    edit: function ( props ) {
      const a = props.attributes;
      const set = props.setAttributes;
      const [ modalOpen, setModalOpen ] = useState( false );
      const [ editIndex, setEditIndex ] = useState( -1 );
      const blockProps = useBlockProps( {
        className: 'timeline-editor'
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
        const items = ( a.items || [] ).slice();
        if ( editIndex >= 0 ) {
          items[ editIndex ] = item;
        } else {
          items.push( item );
        }
        set( { items } );
      }
      function removeAt( i ) {
        const items = ( a.items || [] ).slice();
        items.splice( i, 1 );
        set( { items } );
      }
      function moveUp( i ) {
        set( { items: moveItem( a.items, i, Math.max( 0, i - 1 ) ) } );
      }
      function moveDown( i ) {
        set( {
          items: moveItem(
            a.items,
            i,
            Math.min( ( a.items || [] ).length - 1, i + 1 )
          )
        } );
      }

      // Inspector Controls - Панель настроек справа
      const inspector = el(
        InspectorControls,
        null,
        // Панель: Основные настройки
        el(
          PanelBody,
          { title: 'Основные настройки', initialOpen: true },
          el( SelectControl, {
            label: 'Ориентация',
            value: a.orientation || 'vertical',
            options: [
              { label: 'Вертикальная', value: 'vertical' },
              { label: 'Горизонтальная', value: 'horizontal' }
            ],
            onChange: ( v ) => set( { orientation: v } ),
            help: 'Направление отображения временной шкалы'
          } ),
          el( SelectControl, {
            label: 'Выравнивание',
            value: a.alignment || 'center',
            options: [
              { label: 'Слева', value: 'left' },
              { label: 'По центру', value: 'center' },
              { label: 'Справа', value: 'right' }
            ],
            onChange: ( v ) => set( { alignment: v } )
          } ),
          el( RangeControl, {
            label: 'Отступ между элементами (px)',
            min: 20,
            max: 100,
            step: 5,
            value: a.itemSpacing || 40,
            onChange: ( v ) => set( { itemSpacing: parseInt( v, 10 ) || 40 } )
          } )
        ),
        // Панель: Линия и точки
        el(
          PanelBody,
          { title: 'Линия и точки', initialOpen: false },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Цвет линии ',
              el( ColorIndicator, { colorValue: a.lineColor || '#0073aa' } )
            ),
            el( ColorPicker, {
              color: a.lineColor || '#0073aa',
              onChangeComplete: ( color ) => set( { lineColor: color.hex } ),
              disableAlpha: false
            } )
          ),
          el( RangeControl, {
            label: 'Толщина линии (px)',
            min: 1,
            max: 10,
            step: 1,
            value: a.lineWidth || 4,
            onChange: ( v ) => set( { lineWidth: parseInt( v, 10 ) || 4 } )
          } ),
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Цвет точек ',
              el( ColorIndicator, { colorValue: a.dotColor || '#0073aa' } )
            ),
            el( ColorPicker, {
              color: a.dotColor || '#0073aa',
              onChangeComplete: ( color ) => set( { dotColor: color.hex } ),
              disableAlpha: false
            } )
          ),
          el( RangeControl, {
            label: 'Размер точек (px)',
            min: 10,
            max: 40,
            step: 2,
            value: a.dotSize || 20,
            onChange: ( v ) => set( { dotSize: parseInt( v, 10 ) || 20 } )
          } )
        ),
        // Панель: Карточки событий
        el(
          PanelBody,
          { title: 'Карточки событий', initialOpen: false },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Фон карточек ',
              el( ColorIndicator, { colorValue: a.cardBackground || '#f9f9f9' } )
            ),
            el( ColorPicker, {
              color: a.cardBackground || '#f9f9f9',
              onChangeComplete: ( color ) => set( { cardBackground: color.hex } ),
              disableAlpha: false
            } )
          ),
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Цвет границы ',
              el( ColorIndicator, { colorValue: a.cardBorderColor || '#e0e0e0' } )
            ),
            el( ColorPicker, {
              color: a.cardBorderColor || '#e0e0e0',
              onChangeComplete: ( color ) => set( { cardBorderColor: color.hex } ),
              disableAlpha: false
            } )
          ),
          el( RangeControl, {
            label: 'Толщина границы (px)',
            min: 0,
            max: 5,
            step: 1,
            value: a.cardBorderWidth || 1,
            onChange: ( v ) => set( { cardBorderWidth: parseInt( v, 10 ) || 1 } )
          } ),
          el( RangeControl, {
            label: 'Скругление углов (px)',
            min: 0,
            max: 30,
            step: 2,
            value: a.cardBorderRadius || 8,
            onChange: ( v ) => set( { cardBorderRadius: parseInt( v, 10 ) || 8 } )
          } ),
          el( RangeControl, {
            label: 'Внутренний отступ (px)',
            min: 10,
            max: 50,
            step: 2,
            value: a.cardPadding || 20,
            onChange: ( v ) => set( { cardPadding: parseInt( v, 10 ) || 20 } )
          } )
        ),
        // Панель: Типография
        el(
          PanelBody,
          { title: 'Типография', initialOpen: false },
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Цвет заголовков ',
              el( ColorIndicator, { colorValue: a.titleColor || '#1a1a1a' } )
            ),
            el( ColorPicker, {
              color: a.titleColor || '#1a1a1a',
              onChangeComplete: ( color ) => set( { titleColor: color.hex } ),
              disableAlpha: false
            } )
          ),
          el( RangeControl, {
            label: 'Размер заголовков (px)',
            min: 14,
            max: 32,
            step: 1,
            value: a.titleSize || 20,
            onChange: ( v ) => set( { titleSize: parseInt( v, 10 ) || 20 } )
          } ),
          el(
            'div',
            { style: { marginBottom: '16px' } },
            el(
              'label',
              { style: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' } },
              'Цвет описаний ',
              el( ColorIndicator, { colorValue: a.descriptionColor || '#666666' } )
            ),
            el( ColorPicker, {
              color: a.descriptionColor || '#666666',
              onChangeComplete: ( color ) => set( { descriptionColor: color.hex } ),
              disableAlpha: false
            } )
          ),
          el( RangeControl, {
            label: 'Размер описаний (px)',
            min: 12,
            max: 24,
            step: 1,
            value: a.descriptionSize || 16,
            onChange: ( v ) => set( { descriptionSize: parseInt( v, 10 ) || 16 } )
          } )
        ),
        // Панель: Эффекты
        el(
          PanelBody,
          { title: 'Эффекты', initialOpen: false },
          el( ToggleControl, {
            label: 'Включить анимацию появления',
            checked: typeof a.animationEnabled === 'boolean' ? a.animationEnabled : true,
            onChange: ( v ) => set( { animationEnabled: !! v } ),
            help: 'Плавное появление элементов при прокрутке'
          } ),
          el( ToggleControl, {
            label: 'Эффект при наведении',
            checked: typeof a.hoverEffect === 'boolean' ? a.hoverEffect : true,
            onChange: ( v ) => set( { hoverEffect: !! v } ),
            help: 'Подсветка и увеличение при наведении мыши'
          } )
        )
      );

      // Список событий
      const itemsList = el(
        'div',
        blockProps,
        el( 'h3', { style: { marginTop: 0 } }, 'События Timeline' ),
        ( a.items || [] ).length === 0 && el(
          'p',
          { style: { color: '#666', fontStyle: 'italic' } },
          'Добавьте события для начала работы с временной шкалой'
        ),
        el(
          'div',
          { className: 'timeline-items-list' },
          ( a.items || [] ).map( ( item, i ) =>
            el(
              'div',
              { className: 'timeline-item-editor', key: i },
              el(
                'div',
                { className: 'timeline-item-number' },
                ( i + 1 )
              ),
              el(
                'div',
                { className: 'timeline-item-content' },
                el( 'strong', { style: { display: 'block', marginBottom: '5px' } }, item.title || 'Без заголовка' ),
                el( 'p', { style: { fontSize: '13px', margin: 0, color: '#666' } }, item.description || 'Нет описания' )
              ),
              el(
                'div',
                { className: 'timeline-item-actions' },
                el( Button, {
                  icon: 'edit',
                  onClick: () => openEdit( i ),
                  label: 'Редактировать',
                  size: 'small'
                } ),
                el( Button, {
                  icon: 'arrow-up-alt2',
                  onClick: () => moveUp( i ),
                  label: 'Вверх',
                  disabled: i === 0,
                  size: 'small'
                } ),
                el( Button, {
                  icon: 'arrow-down-alt2',
                  onClick: () => moveDown( i ),
                  label: 'Вниз',
                  disabled: i === ( a.items || [] ).length - 1,
                  size: 'small'
                } ),
                el( Button, {
                  icon: 'trash',
                  isDestructive: true,
                  onClick: () => removeAt( i ),
                  label: 'Удалить',
                  size: 'small'
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
            '+ Добавить событие'
          )
        )
      );

      return el(
        Fragment,
        null,
        inspector,
        itemsList,
        modalOpen &&
          el( TimelineItemModal, {
            initial: editIndex >= 0 ? ( a.items || [] )[ editIndex ] : null,
            onSave: saveModal,
            onRequestClose: () => setModalOpen( false )
          } )
      );
    },

    save: function ( props ) {
      const a = props.attributes;
      const bp = ( wp.blockEditor || wp.editor ).useBlockProps.save( {
        className: 'timeline-block timeline-' + ( a.orientation || 'vertical' ) + ' timeline-align-' + ( a.alignment || 'center' ) + ( a.hoverEffect !== false ? ' timeline-hover' : '' ) + ( a.animationEnabled !== false ? ' timeline-animated' : '' ),
        style: {
          '--timeline-line-color': a.lineColor || '#0073aa',
          '--timeline-line-width': ( a.lineWidth || 4 ) + 'px',
          '--timeline-dot-color': a.dotColor || '#0073aa',
          '--timeline-dot-size': ( a.dotSize || 20 ) + 'px',
          '--timeline-item-spacing': ( a.itemSpacing || 40 ) + 'px',
          '--timeline-card-bg': a.cardBackground || '#f9f9f9',
          '--timeline-card-border-color': a.cardBorderColor || '#e0e0e0',
          '--timeline-card-border-width': ( a.cardBorderWidth || 1 ) + 'px',
          '--timeline-card-border-radius': ( a.cardBorderRadius || 8 ) + 'px',
          '--timeline-card-padding': ( a.cardPadding || 20 ) + 'px',
          '--timeline-title-color': a.titleColor || '#1a1a1a',
          '--timeline-title-size': ( a.titleSize || 20 ) + 'px',
          '--timeline-desc-color': a.descriptionColor || '#666666',
          '--timeline-desc-size': ( a.descriptionSize || 16 ) + 'px'
        }
      } );

      return el(
        'div',
        bp,
        el(
          'div',
          { className: 'timeline-container' },
          ( a.items || [] ).map( ( item, i ) =>
            el(
              'div',
              { className: 'timeline-item', key: i },
              el( 'div', { className: 'timeline-dot' } ),
              el(
                'div',
                { className: 'timeline-content' },
                item.title && el( 'h3', { className: 'timeline-title' }, item.title ),
                item.description && el( 'p', { className: 'timeline-description' }, item.description )
              )
            )
          )
        )
      );
    }
  } );
} )( window.wp );
