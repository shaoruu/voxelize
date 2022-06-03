---
id: "CanvasBox"
title: "Class: CanvasBox"
sidebar_label: "CanvasBox"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### params

• **params**: [`CanvasBoxParams`](../modules.md#canvasboxparams-64)

___

### meshes

• **meshes**: `Group`

___

### layers

• **layers**: `Layer`[] = `[]`

___

### scaleColor

• **scaleColor**: (`multiplier`: `number`) => `void`

#### Type declaration

▸ (`multiplier`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `multiplier` | `number` |

##### Returns

`void`

## Constructors

### constructor

• **new CanvasBox**(`params?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Partial`<[`CanvasBoxParams`](../modules.md#canvasboxparams-64)\> |

## Methods

### makeBoxes

▸ **makeBoxes**(): `void`

#### Returns

`void`

___

### paint

▸ **paint**(`side`, `art`, `layer?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `side` | [`BoxSides`](../modules.md#boxsides-64) \| [`BoxSides`](../modules.md#boxsides-64)[] | `undefined` |
| `art` | [`ArtFunction`](../modules.md#artfunction-64) \| `Color` \| `Texture` | `undefined` |
| `layer` | `number` | `0` |

#### Returns

`void`

## Accessors

### boxMaterials

• `get` **boxMaterials**(): `Map`<`string`, `MeshBasicMaterial`\>

#### Returns

`Map`<`string`, `MeshBasicMaterial`\>