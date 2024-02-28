<script>
  export default {
    name: 'Popover',
    props: {
      tagName: {
        type: String,
        default: 'span',
      },
      reference: {
        type: [String, Element],
      },
      popoverID: {
        type: String,
        default: () => 'popover-' + Math.random().toString(36).substr(2, 9),
      },
      interactiveMethod: {
        type: String,
        default: () => 'auto',
        validator: (value) => ['auto', 'manual'].includes(value),
      },
      trigger: {
        type: String,
        default: () => 'click',
        validator: (value) => ['click', 'hover', 'focus', 'contextmenu'].includes(value),
      },
      placement: {
        type: String,
        default: () => 'top',
        validator: (value) =>
          [
            'top',
            'top-start',
            'top-end',
            'bottom',
            'bottom-start',
            'bottom-end',
            'right',
            'right-start',
            'right-end',
            'left',
            'left-start',
            'left-end',
          ].includes(value),
      },
      offset: {
        type: [String, Number, Array],
        default: () => 0,
      },
      arrow: {
        type: Boolean,
        default: () => true,
      },
    },
    module: {
      prop: 'state',
      event: 'update:state',
    },
    emits: ['update:state', 'show', 'hide', 'toggle'],
    data() {
      return {
        state: 'closed',
      };
    },
    methods: {
      show(event) {
        this.state = 'open';
        const popoverOverlay = this.$el.querySelector('.popover__overlay');
        popoverOverlay.showPopover();
        if (event && event.target) {
          popoverOverlay.referenceElement = event.target;
          this.setPosition(event.target);
        }
        this.$emit('show', this.state, event);
      },
      hide(event) {
        this.state = 'closed';
        const popoverOverlay = this.$el.querySelector('.popover__overlay');
        popoverOverlay.referenceElement = null;
        popoverOverlay.hidePopover();
        this.$emit('hide', this.state, event);
      },
      toggle(event) {
        if (this.state === 'open') {
          this.hide(event);
        } else {
          this.show(event);
        }
        this.$emit('toggle', this.state, event);
      },
      /**
       * @param {String|Element} [reference]
       */
      async bind(reference) {
        await this.$nextTick();
        const popoverOverlay = this.$el.querySelector('.popover__overlay');
        popoverOverlay.addEventListener('toggle', (event) => {
          if (event.newState === 'open') {
            this.setPosition();
          }
          this.$emit(event.newState === 'open' ? 'show' : 'hide', event);
          this.$emit('toggle', event);
          this.$emit('update:state', event.newState);
        });
        let referenceElements = [];
        if (reference) {
          referenceElements = reference instanceof Element ? [reference] : document.querySelectorAll(reference);
        } else if (this.reference) {
          referenceElements =
            this.reference instanceof Element ? [this.reference] : document.querySelectorAll(this.reference);
        } else {
          referenceElements = [...this.$el.querySelectorAll('.popover__reference')];
        }
        referenceElements = referenceElements.filter((element) => element instanceof Element);
        if (!referenceElements.length) {
          console.warn('%c [popover] No reference element found', 'color: orangered');
          return;
        }
        referenceElements.forEach((referenceElement) => {
          if (this.trigger === 'click') {
            referenceElement.addEventListener('click', this.toggle);
          }
          if (this.trigger === 'hover') {
            referenceElement.addEventListener('mouseenter', this.show);
            referenceElement.addEventListener('mouseleave', this.hide);
          }
          if (this.trigger === 'focus') {
            referenceElement.setAttribute('tabindex', '0');
            referenceElement.addEventListener('focus', this.show);
            referenceElement.addEventListener('blur', this.hide);
          }
          if (this.trigger === 'contextmenu') {
            referenceElement.addEventListener('contextmenu', (contextmenuEvent) => {
              contextmenuEvent.preventDefault();
              contextmenuEvent.stopPropagation();
              this.toggle(contextmenuEvent);
            });
          }
          referenceElement.popoverOverlay = popoverOverlay;
        });
        popoverOverlay.referenceElements = referenceElements;
      },
      async setPosition(referenceElement) {
        await this.$nextTick();
        const popoverOverlay = this.$el.querySelector('.popover__overlay');
        referenceElement = referenceElement || popoverOverlay.referenceElement;
        const { width: overlayWidth, height: overlayHeight } = popoverOverlay.getBoundingClientRect();
        const { scrollX, scrollY } = window;
        const { width, height, left, top } = referenceElement.getBoundingClientRect();
        const [dir, align] = this.placement.split('-');
        let offset = Array.isArray(this.offset) ? this.offset.slice(0, 2) : [this.offset, this.offset];
        if (offset.length === 1) offset.push(offset[0]);
        offset = offset.map((item) => parseFloat(item) || 0);
        const position = {
          top: 0,
          left: 0,
        };
        if (dir === 'top') {
          position.top = scrollY + top - overlayHeight - offset[1];
        }
        if (dir === 'bottom') {
          position.top = scrollY + top + height + offset[1];
        }
        if (dir === 'left') {
          position.left = scrollX + left - overlayWidth - offset[0];
        }
        if (dir === 'right') {
          position.left = scrollX + left + width + offset[0];
        }
        if (['top', 'bottom'].includes(dir)) {
          position.left = scrollX + left + width / 2 - overlayWidth / 2;
          if (align === 'start') {
            position.left = scrollX + left + offset[0];
          }
          if (align === 'end') {
            position.left = scrollX + left - overlayWidth + width - offset[0];
          }
        }
        if (['left', 'right'].includes(dir)) {
          position.top = scrollY + top + height / 2 - overlayHeight / 2;
          if (align === 'start') {
            position.top = scrollY + top + offset[1];
          }
          if (align === 'end') {
            position.top = scrollY + top - overlayHeight + height - offset[1];
          }
        }
        popoverOverlay.style.top = `${position.top}px`;
        popoverOverlay.style.left = `${position.left}px`;
        popoverOverlay.referenceElement = referenceElement;
      },
    },
    mounted() {
      this.bind();
    },
  };
</script>

<template>
  <component ref="refPopover" class="popover" :is="tagName">
    <slot name="reference" class="popover__reference" :popoverID="popoverID" :popovertarget="popoverID"></slot>
    <div
      ref="popoverOverlay"
      class="popover__overlay"
      :popover="interactiveMethod"
      :id="popoverID"
      :popoverID="popoverID"
      :state="state"
      :placement="placement"
    >
      <div class="popover__arrow" v-show="arrow"></div>
      <div class="popover__content">
        <slot></slot>
      </div>
    </div>
  </component>
</template>

<style lang="scss" scoped>
  .popover {
    &__overlay {
      margin: 0;
      border: none;
      border-radius: 4px;
      padding: 0;
      overflow: visible;
      background-color: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      transition: all 0.1s ease;
    }
    &__arrow {
      --arrow-offset: 50%;
      --arrow-size: 6px;
      position: absolute;
      width: 0;
      height: 0;
      border-width: var(--arrow-size);
      border-style: solid;
      border-color: transparent;
    }
    [placement*='start'] &__arrow {
      --arrow-offset: 0%;
    }
    [placement*='end'] &__arrow {
      --arrow-offset: 100%;
    }
    [placement*='top'] &__arrow {
      bottom: calc(0px - var(--arrow-size));
      left: calc(var(--arrow-offset) - 6px);
      border-bottom-width: 0;
      border-top-color: #fff;
    }
    [placement*='bottom'] &__arrow {
      top: calc(0px - var(--arrow-size));
      left: calc(var(--arrow-offset) - 6px);
      border-top-width: 0;
      border-bottom-color: #fff;
    }
    [placement*='left'] &__arrow {
      right: calc(0px - var(--arrow-size));
      top: calc(var(--arrow-offset) - 6px);
      border-right-width: 0;
      border-left-color: #fff;
    }
    [placement*='right'] &__arrow {
      left: calc(0px - var(--arrow-size));
      top: calc(var(--arrow-offset) - 6px);
      border-left-width: 0;
      border-right-color: #fff;
    }
  }
</style>
