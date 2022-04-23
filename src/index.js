/**
 * Build styles
 */
import './index.css';
import {ICON} from './icon';

/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license MIT
 * @version 2.0.0
 */
export default class Header {

    constructor({data, config, api, readOnly}) {
        this.api = api;
        this.readOnly = readOnly;

        /**
         * Styles
         *
         * @type {object}
         */
        this._CSS = {
            block: this.api.styles.block,
            settingsButton: this.api.styles.settingsButton,
            settingsButtonActive: this.api.styles.settingsButtonActive,
            wrapper: 'ce-header',
        };

        /**
         * Tool's settings passed from Editor
         *
         * @type {HeaderConfig}
         * @private
         */
        this._settings = Object.assign({defaultLevel: 2}, config);

        /**
         * Block's data
         *
         * @type {HeaderData}
         * @private
         */
        this._data = this.normalizeData(data);

        /**
         * List of settings buttons
         *
         * @type {HTMLElement[]}
         */
        this.settingsButtons = [];

        /**
         * Main Block wrapper
         *
         * @type {HTMLElement}
         * @private
         */
        this._element = this.getTag();
    }

    /**
     * Normalize input data
     *
     * @param {HeaderData} data - saved data to process
     *
     * @returns {HeaderData}
     * @private
     */
    normalizeData(data) {
        const newData = {};

        if (typeof data !== 'object') {
            data = {};
        }

        newData.text = data.text || '';
        newData.level = parseInt(data.level) || this._settings.defaultLevel;

        return newData;
    }

    /**
     * Return Tool's view
     *
     * @returns {HTMLHeadingElement}
     * @public
     */
    render() {
        return this._element;
    }

    /**
     * Create Block's settings block
     *
     * @returns {HTMLElement}
     */
    renderSettings() {
        const holder = document.createElement('DIV');

        const levels = Header.getSubTools(this._settings);
        // do not add settings button, when only one level is configured
        if (levels.length <= 1) {
            return holder;
        }

        /** Add type selectors */
        levels.forEach(level => {
            const selectTypeButton = document.createElement('SPAN');

            selectTypeButton.classList.add(this._CSS.settingsButton);

            /**
             * Highlight current level button
             */
            if (this.currentLevel.level === level.data.level) {
                selectTypeButton.classList.add(this._CSS.settingsButtonActive);
            }

            selectTypeButton.innerHTML = level.icon;
            selectTypeButton.dataset.level = level.data.level;

            selectTypeButton.addEventListener('click', () => {
                this.setLevel(level.data.level);
            });

            /**
             * Append settings button to holder
             */
            holder.appendChild(selectTypeButton);

            /**
             * Save settings buttons
             */
            this.settingsButtons.push(selectTypeButton);
        });

        return holder;
    }

    /**
     * Callback for Block's settings buttons
     *
     * @param {number} level - level to set
     */
    setLevel(level) {
        this.data = {
            level: level,
            text: this.data.text,
        };

        /**
         * Highlight button by selected level
         */
        this.settingsButtons.forEach(button => {
            button.classList.toggle(this._CSS.settingsButtonActive, parseInt(button.dataset.level) === level);
        });
    }

    /**
     * Method that specified how to merge two Text blocks.
     * Called by Editor.js by backspace at the beginning of the Block
     *
     * @param {HeaderData} data - saved data to merger with current block
     * @public
     */
    merge(data) {
        const newData = {
            text: this.data.text + data.text,
            level: this.data.level,
        };

        this.data = newData;
    }

    /**
     * Validate Text block data:
     * - check for emptiness
     *
     * @param {HeaderData} blockData — data received after saving
     * @returns {boolean} false if saved data is not correct, otherwise true
     * @public
     */
    validate(blockData) {
        return blockData.text.trim() !== '';
    }

    /**
     * Extract Tool's data from the view
     *
     * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
     * @returns {HeaderData} - saved data
     * @public
     */
    save(toolsContent) {
        return {
            text: toolsContent.innerHTML,
            level: this.currentLevel.level,
        };
    }

    /**
     * Allow Header to be converted to/from other blocks
     */
    static get conversionConfig() {
        return {
            export: 'text', // use 'text' property for other blocks
            import: 'text', // fill 'text' property from other block's export string
        };
    }

    /**
     * Sanitizer Rules
     */
    static get sanitize() {
        return {
            level: false,
            text: {},
        };
    }

    /**
     * Returns true to notify core that read-only is supported
     *
     * @returns {boolean}
     */
    static get isReadOnlySupported() {
        return true;
    }

    /**
     * Get current Tools`s data
     *
     * @returns {HeaderData} Current data
     * @private
     */
    get data() {
        this._data.text = this._element.innerHTML;
        this._data.level = this.currentLevel.level;

        return this._data;
    }

    /**
     * Store data in plugin:
     * - at the this._data property
     * - at the HTML
     *
     * @param {HeaderData} data — data to set
     * @private
     */
    set data(data) {
        this._data = this.normalizeData(data);

        /**
         * If level is set and block in DOM
         * then replace it to a new block
         */
        if (data.level !== undefined && this._element.parentNode) {
            this.getTag();
        }

        /**
         * If data.text was passed then update block's content
         */
        if (data.text !== undefined) {
            this._element.innerHTML = this._data.text || '';
        }
    }

    /**
     * Get tag for target level
     * By default returns second-leveled header
     *
     * @returns {HTMLElement}
     */
    getTag() {
        /**
         * Create element for current Block's level
         */
        let tag = this._element;
        if (!tag) {
            tag = document.createElement('div');
            tag.classList.add(this._CSS.wrapper);
        }

        /**
         * Add text to block
         */
        tag.innerHTML = this._data.text || '';

        /**
         * change dataset
         */
        tag.dataset.header = this.currentLevel.tag;

        /**
         * Make tag editable
         */
        tag.contentEditable = this.readOnly ? 'false' : 'true';

        /**
         * Add Placeholder
         */
        tag.dataset.placeholder = this.api.i18n.t(this._settings.placeholder || '');

        return tag;
    }

    /**
     * Get current level
     *
     * @returns {level}
     */
    get currentLevel() {
        return this.getLevel(this._data.level || this._settings.defaultLevel);
    }

    getLevel(level) {
        let find = Header.getSubTools(this._settings).find(item => item.data.level === level);
        return {
            level: find.data.level,
            tag: `H${find.data.level}`,
            icon: find.icon
        };
    }

    /**
     * Available header levels
     *
     * @returns {level[]}
     */
    get levels() {
        return Header.getSubTools(this._settings).map(item => {
            return {
                level: item.data.level,
                tag: `H${item.data.level}`,
                icon: item.icon
            };
        });
    }

    /**
     * Handle H1-H6 tags on paste to substitute it with header Tool
     *
     * @param {PasteEvent} event - event with pasted content
     */
    onPaste(event) {
        const content = event.detail.data;

        /**
         * Define default level value
         *
         * @type {T}
         */
        let level = this.getLevel(this._settings.defaultLevel);

        let find = Header.tags.find(item => content.tagName === `H${item}`);
        if (find) {
            level = find;
        }

        if (this._settings.levels) {
            // Fallback to nearest level when specified not available
            level = this._settings.levels.reduce((prevLevel, currLevel) => {
                return Math.abs(currLevel - level) < Math.abs(prevLevel - level) ? currLevel : prevLevel;
            });
        }

        this.data = {
            level,
            text: content.innerHTML
        };
    }

    /**
     * Used by Editor.js paste handling API.
     * Provides configuration to handle H1-H6 tags.
     *
     * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
     */
    static get pasteConfig() {
        return {
            tags: Header.tags.map(i => `H${i}`),
        };
    }

    static get tags() {
        return [1, 2, 3, 4, 5, 6];
    }

    /**
     * Get Tool toolbox settings
     * icon - Tool icon's SVG
     * title - title to show in toolbox
     *
     * @returns {{icon: string, title: string}}
     */
    static get toolbox() {
        return {
            icon: ICON.tool,
            title: 'Heading'
        };
    }

    static getSubTools(config = {}) {
        const levels = config.levels ? Header.tags.filter(l => config.levels.includes(l)) : Header.tags;
        return levels.map(level => {
            return {
                type: `H${level}`,
                data: {
                    level: level
                },
                icon: ICON[`H${level}`]
            };
        });
    }
}


