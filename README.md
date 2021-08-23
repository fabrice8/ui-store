UI-Store
==================================================

Interact with Browser Storages (localStore, sessionStore, ...) and NodeJS in-Memory with ease.

Environments in which to use UI-Store
--------------------------------------

- Browser support
- Node, and other non-browser environments.

[![npm version][npm-badge]][npm]

[npm]: https://www.npmjs.org/package/ui-store
[npm-badge]: https://img.shields.io/npm/v/@fabrice8/ui-store.svg?style=flat-square


## Goals

I created this project out of frustration with the existing browser storage APIs and the limitation of mapping properly the stored data to be able to manipulate them adequately. UI-Store help developers to interact with available environment storages using a single API and also provides the ability to secure the stored data.

## Features

After building couple of Single Page Applications, I developed requirements and opinions about what a Browser storage should provide and how it should be implemented. The following is that list:

* Set, Get, Clear data: Already the case with the native APIs.
* Single and concise API to interact with all type of storage.
* Support all Javascript Types of data: String, Number, JSON-object, Array, ... No need to stringify everything before to save, neither to parse data when retreived.
* Select the right Storage depending the environment on behalf of the developer.
* Secure data by encrypting them in the storage.
* Save flash data: Temporary hold data and delete after retreived.
* Map stored data by prefixing attributes/keys for grouping fetch and targeted flush delete.
* In-memory support in NodeJS environment.


## Installation

Install using npm:

```shell
$ npm install @fabrice8/ui-store
```
then import it into your code

```javascript
const UIStore = require('@fabrice8/ui-store');

// or 

import uiStore from '@fabrice8/ui-store'; // ESM
```

Via HTML `<script>` tag with the CDN source:

```HTML
<script src="https://cdn.jsdelivr.net/npm/@fabrice8/ui-store@1.0.3/ui-store.min.js" type="text/javascript"></script>
```

Or download the `ui-store.js` or `ui-store.min.js` into your project.

```HTML
<script src="/ui-store.min.js" type="text/javascript"></script>
```


## Usage

Create new instance of the UI-Store Object function.

```javascript
const options = {
    prefix: 'my_',
    storage: 'in-memory',
    encrypt: true,
    // ...
}

const uistore = new UIStore( options );
```


## Options

* **prefix**: `String` Prefix of attributes in the store. **Important** during flush data process.

* **storage**: `String` Targeted storage: **localStorage**, **sessionStorage**, **in-memory**, ... Default: `localStorage`

* **encrypt**: `Boolean` Define whether data should be encrypted before to be stored. Default: `false`

* **token**: `String` Specify a unique token to use as salt to encrypt the data



## Methods

### `set(attribute, data)`

Insert data to the storage

```javascript
const data = "hello";

uistore.set('greeting', data );
```

### `get(attribute)`

Retreive stored data. Return `false` when the attribute of data specify does not exist.

```javascript
const data = uistore.get('greeting');

console.log( data ); // Hello
```

### `temp(attribute, data)`

Insert temporary a data to the storage. The stored data get deleted when `get()` method called on that attribute. Useful for saving flash data.

```javascript
const data = { foo: 'bar' };
uistore.temp('attr', data);

const data2 = uistore.get('attr');
console.log( data2 ); // { foo: 'bar' }

// Data stored calling `temp` method can only be `get` once
console.log( uistore.get('attr') ); // undefined
```

### `update(attribute, data, [action])`

Update stored. This method is useful the most to make changes on Array or Object data without re-writing the whole set like we normally do with the conventional browser storage APIs. It accepts three arguments, the `attribute`, `data`, and `action` (Optional)
- When the stored data is an array, use the `action` argument to specify what to do: `push`, `shift`, `pop` ...
- When the stored data is an Object, the only use of the `action` argument is to delete a field. If `action` argument is not set, `data` will be merge with the existing stored object so it must also be an object.
    **Note**: Specify array of fields (`data` argument) to delete multiple fields of as store data Object.

Return `false` if the update failed


**Example with Array Data**

```javascript
const data = [ 'foo' ];
uistore.set('attr', data);

// Example with Array Data
uistore.update('attr', 'bar', 'push') // add new value to the Array
console.log( uistore.get('attr') ) // [ 'foo', 'bar' ]
```

**Example with Object Data**

```javascript

const data = { foo: 'bar' };
uistore.set('attr', data );

const data1 = { bar: 'foo' }
uistore.update('attr', data1) // The new object will be merge with the existing stored data
console.log( uistore.get('attr') ) // { foo: 'bar', bar: 'foo' }

// Update by deleting object field: The second argument c
uistore.update('attr', 'foo', 'delete');
console.log( uistore.get('attr') ); // { bar: 'foo' } : the `foo` field is deleted
```

### `clear(attributes)`

Clear single or multiple store set.

```javascript
// Clear single set
uistore.clear('greeting');

// Clear multiple set
uistore.clear([ 'greeting', 'attr' ]);
```

### `flush([prefix])`

Clear all stored set with the attribute prefix specify in the options.

```javascript
uistore.flush('my_');
```

## Additional feature

Sometimes, when using a View rendering engine like `handlebars`, `twig`, ... for instance, the injected scope data, instead of being hold in a global variable, can be immediately stored in one of the browser storage once the DOM get loaded. The use cases may not seem obvious, but here is an example:

```handlebars
<body>
    <!-- UserData is injected: Eg. Using handlebar view engine -->
    <div data-store="profile" data-store-type="set" data-store-value="{{ UserData }}">

    <script src="/ui-store.min.js" type="text/javascript"></script>
    <script type="text/javascript">
        var uistore = new UIStore()

        // Display the content of `UserData` injected
        console.log( uistore.get('profile') )
    </script>
</body>
```

These HTML tag attributes can be use anywhere in the document to trigger this feature.

- **data-store** Specify the attribute of the store
- **data-store-type** Specify the method to use for storing the data. Only `set`, `temp`, `update` can be use for now.
- **data-store-value** Payload of the data to store (Must be a String)

    ### Note:
    The various HTML tag attributes must be set before the `UIStore` object get instanciated, before it works


That's it!



Feedback & Contribution
-------

You know the say: No one is whole alone! So, feedbacks and the smallest contributions you can think of are all welcome. Kindly report any encounted [Issues here][] and I'll be glad to work on it right away. Thank you.


License
-------

This software is free to use under the MIT license. See the [LICENSE file][] for license text and copyright information.


[LICENSE file]: https://github.com/fabrice8/ui-store/blob/master/LICENSE
[Issues here]: https://github.com/fabrice8/ui-store/issues