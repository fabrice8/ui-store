/** User-Interface Storage Manager
 * 
 * @Version: 1.0.3
 * @Author: Fabrice Marlboro
 * @Created: 16/05/2020
 * @repository: https://github.com/fabrice8/ui-store
 * 
*/
( function(){
	'use strict';
	const Global = window || global
	
	let
	StoreManager,
	is_storable

	function UIStore( options ){

		const
		_this = this,
		_prefix = ( options.prefix || 'uistore' )+':',
		_token = options.token || 'kqNtQBZuS856ODqw6hQa4J'
		let Flashes

		// Use explicitly localStorage or sessionStorage alternatively
		try {
			switch( options.storage ){

				/* Use window in browser or Global in nodejs as
					temporary data storage
				*/
				case 'in-memory': is_storable = true
									StoreManager = new InMemory
						break

				default: is_storable = ( StoreManager = Global.localStorage ) !== undefined
			}
		}
		catch( error ){ is_storable = false }


		function _encode( string ){

			if( options && !options.encrypt ) return string

			var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
			var result = ''
			var i = 0

			do {
				var a = string.charCodeAt(i++)
				var b = string.charCodeAt(i++)
				var c = string.charCodeAt(i++)

				a = a ? a : 0
				b = b ? b : 0
				c = c ? c : 0

				var b1 = ( a >> 2 ) & 0x3F
				var b2 = ( ( a & 0x3 ) << 4 ) | ( ( b >> 4 ) & 0xF )
				var b3 = ( ( b & 0xF ) << 2 ) | ( ( c >> 6 ) & 0x3 )
				var b4 = c & 0x3F

				if( !b ) b3 = b4 = 64
				else if( !c ) b4 = 64

				result += b64.charAt( b1 ) + b64.charAt( b2 ) + b64.charAt( b3 ) + b64.charAt( b4 )

			} while ( i < string.length )

			// Introduce unknown portion of string
			let spliceIndex = ( string.length / 2 ) - 1

			return result.slice(0, spliceIndex ) + _token + result.slice( spliceIndex )
		}

		function _decode( string ){
			// Default Reverse Encrypting Tool: Modified Base64 decoder
			if( options && !options.encrypt ) return string

			var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
			var result = ''
			var i = 0

			// Remove the unknown striing portion
			string = string.replace( _token, '')

			do {
				var b1 = b64.indexOf( string.charAt(i++) )
				var b2 = b64.indexOf( string.charAt(i++) )
				var b3 = b64.indexOf( string.charAt(i++) )
				var b4 = b64.indexOf( string.charAt(i++) )

				var a = ( ( b1 & 0x3F ) << 2 ) | ( ( b2 >> 4 ) & 0x3 )
				var b = ( ( b2 & 0xF  ) << 4 ) | ( ( b3 >> 2 ) & 0xF )
				var c = ( ( b3 & 0x3  ) << 6 ) | ( b4 & 0x3F )

				result += String.fromCharCode(a) + (b?String.fromCharCode(b):'') + (c?String.fromCharCode(c):'')

			} while( i < string.length )

			return result
		}

	  this.set = function( attribute, value ){

			if( !attribute || !value || !is_storable ) return false

			// Stringify the value
			value = typeof value == 'object' ? JSON.stringify( value ) : String( value )

			// Save the encoded string
			StoreManager.setItem( _prefix + _encode( attribute ), _encode( value ) )
			return true
		}

	  this.temp = function( attribute, value ){

			if( !attribute || !value || !is_storable ) return false

			this.set( attribute, value )

			// Keep-record to delete it once it's get
			this.update( '--Flashes--', true, attribute )
			return true
		}

		this.get = function( attribute, data ){

			if( !attribute || !is_storable ) return false
			if( !( data = StoreManager.getItem( _prefix + _encode( attribute ) ) ) ) return false

			data = _decode( data )

			try{ data = JSON.parse( data ) }
			catch( err ){}

			// Clear once get flash attributes
			Flashes = JSON.parse( _decode( StoreManager.getItem( _prefix + _encode('--Flashes--') ) ) )
			if( Flashes.hasOwnProperty( attribute ) )
				this.clear( attribute, Flashes )

			return Number( data ) || data
		}

		this.update = function( attribute, data, action ){

			let item

			// update is efficient only when the data is an array or object
			if( !action || !data ) return false
			if( !attribute || !is_storable ) return false
			if( !( item = StoreManager.getItem( _prefix + _encode( attribute ) ) ) ) return false

			item = _decode( item )

			try {
				item = JSON.parse( item )
				
				if( Array.isArray( item ) ){
					// update array: push, shift, unshift, pop, ...
					if( !['delete', 'remove'].includes( action ) )
						item[ action ]( data )

					// Delete or Remove item from array
					else 
						item.map( ( each, index ) => {
							if( ( typeof data == 'string' && each == data )
									|| ( Array.isArray( data ) && data.includes( each ) ) )
								item.splice( index, 1 )
						} )
				}
				
				// Update by "add, delete or update" a set or multiple sets of object
				else {
					// Adding
					if( !['delete', 'remove'].includes( action ) )
						typeof data == 'object' ?
									Object.assign( item, data ) // multi-key update (Object)
									: item[ action ] = data // one key update
					// Delete or Remove
					else {
						// Single set of key to delete
						if( typeof data == 'string' ){
							if( !item.hasOwnProperty( data ) )
								return false

							delete item[ data ]
						}

						// Delete multiple-set of keys
						if( Array.isArray( data ) )
							data.map( each => {
								if( item.hasOwnProperty( each ) )
									delete item[ each ]
							} )
					}
				}

				this.set( attribute, item )
				return true
			}
      catch( err ){ return false }
    }

		this.clear = function( attribute, Flashes ){

			if( !attribute || !is_storable ) return false

			Flashes = Flashes || JSON.parse( _decode( StoreManager.getItem( _prefix + _encode('--Flashes--') ) ) )

			function removeThis( attr ){

				StoreManager.removeItem( _prefix + _encode( attr ) )

				// Auto-remove flashes
				if( Flashes.hasOwnProperty( attr ) )
					_this.update( '--Flashes--', attr, 'delete' )
			}

			// Multiple attributes
			Array.isArray( attribute ) ?
							attribute.map( removeThis )
							: removeThis( attribute ) // single attribute

			return true
		}

	  this.flush = function( prefix ){
			// Delete all data saved on a specific prefix
			if( !is_storable ) return false

			const regex = new RegExp( '^'+ prefix || _prefix )

			Object.keys( StoreManager )
					.map( each => { 
						if( regex.test( each ) ) 
							StoreManager.removeItem( each ) 
					} )

			return true
		}

		// Initialize flash storage tracker
		if( !( this.get('--Flashes--') ) )
			this.set('--Flashes--', {})

		// Crawl the document and collect all data to be
		// stored define by attributes
		$ && $('[data-store]').each( function(){

			const
			$this = $(this),
			name = $this.data('store'),
			value = $this.data('store-value')

			let type = $this.data('store-type')

			if( !name || !value ) return

			// Default storage action
			if( !type || ![ 'temp', 'update' ].includes( type ) ) type = 'set'

			// Remove the data and related attribute from
			// the DOM once they got stored
			if( _this[ type ]( name, value ) )
				$this.removeAttr('data-store')
							.removeAttr('data-store-type')
							.removeAttr('data-store-value')
		} )
	}

	function InMemory(){
		// Use window in Browser & global in Nodejs
		Global.UIInMemoryStore = {}

		this.Storage = Global.UIInMemoryStore

		this.setItem = function( key, value ){ this.Storage[ key ] = value }
		this.getItem = function( key ){ return this.Storage[ key ] }
		this.removeItem = function( key ){ delete this.Storage[ key ] }
	}

	/* Clean window In-memory leaks when it's
		use previously to store data
	*/
	Global.UIInMemoryStore = null

	// Export UIStore to the environment's global object
	typeof module !== 'undefined'
	&& module.exports ?
				module.exports = UIStore
				: Global.UIStore = UIStore
} )()
