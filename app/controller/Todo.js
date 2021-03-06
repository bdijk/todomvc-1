Ext.define('todomvc.controller.Todo', {
		extend : 'Ext.app.Controller',

		requires : ['todomvc.view.Item'],
//		items : Ext.create('todomvc.store.Items'),
		uuidg : new Ext.data.UuidGenerator(),


		refs : [
			{ ref : 'listItems', selector : '#listItems'},
			{ ref : 'itemsLeft', selector : '#itemsLeft'},
			{ ref : 'allItems', selector : '#allItems'},
			{ ref : 'clearCompleted', selector : '#clearCompleted'},
			{ ref : 'main', selector : '#main'}
		],

		getItemController : function(){
			var c = this.application.getController('Item');
			this.itemController = function(){ return c; };
			return c;
		},

		stores : ['Items'],

		init : function(){
			this.control({
					'#nuevoTodo textfield' : {
							keyup : this.keyup
					},
					'#clearCompleted' : {
						click : this.clearCompleted
					},

					'#allItems' : {
						change : this.allItemsChange
					}
			});

			this.items = this.getStore('Items');
			this.items.removeAll();

			this.items.on('add', this.add, this);
			//this.items.on('remove', this.remove, this);
			//check this
			this.items.on('datachanged', this.updateItemsLeft, this);
			this.items.on('update', this.updateItemsLeft, this);

			window.items = this.items;
		},

		keyup : function(cmp,ev){
			if (ev.keyCode==13){
				this.addTodo(cmp.getValue());
			}
		},

		addTodo : function(txt){
			this.items.add({ id : this.uuidg.generate(), description : txt, lastUpdated : new Date()});
		},

		add : function(store, records, index, eOpt){
			var item = this.getItemController().newItem(records[0]);
			this.getListItems().add(item);
			//this.getListItems().ownerCt.doLayout();
		},

		itemCreated : function(item){
		},

		clearCompleted	: function(){
			var done = [];
			var me=this;
			this.items.each(function(item){
				if (item.get("done")) done.push(item);
			});

			Ext.Array.each(done, function(item){
				me.getItemController().deleteItem(item.get('id'));
				me.items.remove(item);
			});
		},

		updateItemsLeft : function(){
			if (this.updatingAll) return;

			var items = this.items.data.length;


			this.getAllItems().setDisabled( !items);

			var remaining = this.items.query('done', false, false, false, true);
			this.getItemsLeft().setValue( (remaining.length) + ' items left');
			this.getAllItems().setValue( remaining.length===0 );
			var doned =  items-remaining.length;
			this.getClearCompleted().setVisible(doned);
			this.getClearCompleted().setText( 'clear completed (' + doned + ')' );

			this.getMain().doLayout();
		},

		allItemsChange : function(){
			this.updatingAll=true;

			var done = this.getAllItems().getValue();
			this.items.each( function(item){
				item.commit(false);
				item.set('done', done);
			},this);

			this.updatingAll=false;
		}

});
