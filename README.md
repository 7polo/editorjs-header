# Heading Tool

rendered by DIV tag instead of Head tag

## Installation

### Install via NPM

Get the package

```shell
npm i --save @7polo/editorjs-header
```


## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...

  tools: {
    ...
    header: Header,
  },

  ...
});
```

## Shortcut

You can insert this Block by a useful shortcut. Set it up with the `tools[].shortcut` property of the Editor's initial config.

```javascript
var editor = EditorJS({
  ...

  tools: {
    ...
    header: {
      class: Header,
      shortcut: 'CMD+SHIFT+H',
    },
  },

  ...
});
```

## Config Params

All properties are optional.

| Field        | Type       | Description                 |
| ------------ | ---------- | --------------------------- |
| placeholder  | `string`   | header's placeholder string |
| levels       | `number[]` | enabled heading levels      |
| defaultLevel | `number`   | default heading level       |

```javascript
var editor = EditorJS({
  ...

  tools: {
    ...
    header: {
      class: Header,
      config: {
        placeholder: 'Enter a header',
        levels: [2, 3, 4],
        defaultLevel: 3
      }
    }
  }

  ...
});
```

## Tool's settings

![An image showing the header block tool](https://capella.pics/634ad545-08d7-4cb7-8409-f01289e0e5e1.jpg)

You can select one of six levels for heading.

## Output data

| Field | Type     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| text  | `string` | header's text                                    |
| level | `number` | level of header: 1 for H1, 2 for H2 ... 6 for H6 |

```json
{
  "type": "header",
  "data": {
    "text": "Why Telegram is the best messenger",
    "level": 2
  }
}
```
