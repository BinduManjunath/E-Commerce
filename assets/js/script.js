/**
 * @author bindu.m
 * @description This file contains the methods for displaying the products of an e-commerce application
 */

$(function () {

	// Globals variables

		// 	An array containing products objects
	var products = [],

		// Array filter
		filters = {};


	//	Event handlers

	//	Checkbox filtering

	var checkboxes = $('.all-products input[type=checkbox]');

	/**
	 * Method called when check boxes are selcted
	 */
	checkboxes.click(function () {

		var that = $(this),
			specName = that.attr('name');
		if(that.is(":checked")) {
			if(!(filters[specName] && filters[specName].length)){
				filters[specName] = [];
			}

			//	Push values into the chosen filter array
			filters[specName].push(that.val());
			createQueryHash(filters);

		}

		// Clear the array when checkboxes are unchecked
		if(!that.is(":checked")) {

			if(filters[specName] && filters[specName].length && (filters[specName].indexOf(that.val()) != -1)){

				var index = filters[specName].indexOf(that.val());
				filters[specName].splice(index, 1);
				if(!filters[specName].length){
					delete filters[specName];
				}

			}

			createQueryHash(filters);
		}
	});

	/**
	 * This method is called when clear all is clicked
	 */
	$('.filters button').click(function (e) {
		e.preventDefault();
		window.location.hash = '#';
	});


	// Single product page buttons

	var singleProductPage = $('.single-product');

	singleProductPage.on('click', function (e) {

		if (singleProductPage.hasClass('visible')) {
			var clicked = $(e.target);

			// If the close button or the background are clicked go to the previous page.
			if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
				// Change the url hash with the last used filters.
				createQueryHash(filters);
			}

		}

	});



	/**
	 * Getting the data from product.json on page load
	 */
	$.getJSON( "products.json", function( data ) {

		products = data;
		// Creating html
		generateAllProductsHTML(products);

		// hashchange triggered
		$(window).trigger('hashchange');
	});


	/**
	 * render functionality
	 */
	$(window).on('hashchange', function(){
		render(decodeURI(window.location.hash));
	});



/**
 * 
 * @param {url to be rendered} url 
 */
	function render(url) {

		var temp = url.split('/')[0];

		// Hiding current content
		$('.main-content .page').removeClass('visible');


		var	map = {

			// The "Homepage"
			'': function() {

				filters = {};
				checkboxes.prop('checked',false);

				renderProductsPage(products);
			},

			// Single Products page
			'#product': function() {
				var index = url.split('#product/')[1].trim();

				renderSingleProductPage(index, products);
			},

			// Page with filtered products
			'#filter': function() {
				url = url.split('#filter/')[1].trim();
				try {
					filters = JSON.parse(url);
				}
				catch(err) {
					window.location.hash = '#';
					return;
				}

				renderFilterResults(filters, products);
			}

		};

		if(map[temp]){
			map[temp]();
		}
		// render error page
		else {
			renderErrorPage();
		}

	}


	/**
	 * This method is called only once to load html for all products
	 * @param {Product} data 
	 */
	function generateAllProductsHTML(data){

		var list = $('.all-products .products-list');

		var theTemplateScript = $("#products-template").html();
		//Compile the template​
		var theTemplate = Handlebars.compile (theTemplateScript);
		list.append (theTemplate(data));
		list.find('li').on('click', function (e) {
			e.preventDefault();

			var productIndex = $(this).data('index');

			window.location.hash = 'product/' + productIndex;
		})
	}

	// This function receives an object containing all the product we want to show.
	function renderProductsPage(data){

		var page = $('.all-products'),
			allProducts = $('.all-products .products-list > li');

		// Hide all the products in the products list.
		allProducts.addClass('hidden');
		allProducts.each(function () {

			var that = $(this);

			data.forEach(function (item) {
				if(that.data('index') == item.id){
					that.removeClass('hidden');
				}
			});
		});
		page.addClass('visible');

	}


	// Opens up a preview for one of the products.
	// Its parameters are an index from the hash and the products object.
	function renderSingleProductPage(index, data){

		var page = $('.single-product'),
			container = $('.preview-large');
		if(data.length){
			data.forEach(function (item) {
				if(item.id == index){
					// Populate '.preview-large' with the chosen product's data.
					container.find('h3').text(item.name);
					container.find('img').attr('src', item.image.large);
					container.find('p').text(item.description);
				}
			});
		}

		page.addClass('visible');

	}

/**
 * This method renders the filtered product
 * @param {filters} filters 
 * @param {categories} products 
 */
	function renderFilterResults(filters, products){

			// This array contains all the possible filter criteria.
		var criteria = ['manufacturer'],
			results = [],
			isFiltered = false;

		checkboxes.prop('checked', false);


		criteria.forEach(function (c) {

			// Check if each of the possible filter criteria is actually in the filters object.
			if(filters[c] && filters[c].length){
				if(isFiltered){
					products = results;
					results = [];
				}


				// Iterate over the entries inside filters.criteria (remember each criteria contains an array).
				filters[c].forEach(function (filter) {

					// Iterate over the products.
					products.forEach(function (item){

						if(typeof item.specs[c] == 'number'){
							if(item.specs[c] == filter){
								results.push(item);
								isFiltered = true;
							}
						}

						if(typeof item.specs[c] == 'string'){
							if(item.specs[c].toLowerCase().indexOf(filter) != -1){
								results.push(item);
								isFiltered = true;
							}
						}

					});
					if(c && filter){
						$('input[name='+c+'][value='+filter+']').prop('checked',true);
					}
				});
			}

		});
		renderProductsPage(results);
	}


	// Shows the error page.
	function renderErrorPage(){
		var page = $('.error');
		page.addClass('visible');
	}
	function createQueryHash(filters){
		if(!$.isEmptyObject(filters)){
			window.location.hash = '#filter/' + JSON.stringify(filters);
		}
		else{
			window.location.hash = '#';
		}

	}

});