var CURRENT_CATEGORY = "cat";
var CHILD_CATEGORIES = "child_cat";
var ATTRIBUTES = "ref";
var SPLIT_CHAR = "^";
var JOIN_CHAR = "_";
var SPLIT_CHAR_ATTRIBUTES = ":";
var SORT = "sort";

$(document).ready(function() {

	// backButton();

	getCategories();

	// listeners
	sort();
	// search();
	// login();
	// price();
	// backbutton();
	clearAllRefiners();
	backToTop();
});

function backButton() {
	$("#previous_page").val(document.referrer);

	console.log("TOP = previous_href = " + $("#previous_href").val()
			+ " and previous_page " + $("#previous_page").val());

	$(function() {
		/*
		 * this swallows backspace keys on any non-input element. stops
		 * backspace -> back
		 */
		var rx = /INPUT|SELECT|TEXTAREA/i;

		$(document).bind(
				"keydown keypress",
				function(e) {
					if (e.which == 8) { // 8 == backspace
						if (!rx.test(e.target.tagName) || e.target.disabled
								|| e.target.readOnly) {

							window.addEventListener('popstate',
									function(event) {
										// window.location.href =
										// $("#previous_page").val();
										// history.replaceState({}, 'Title:
										// Google', 'http://www.google.com/');
										history.replaceState(null,
												document.title,
												location.pathname);
										// replaces first element of last
										// element of stack with
										// google.com/gmail so can be used
										// further
										setTimeout(
												function() {
													location.replace($(
															"#previous_page")
															.val());
												}, 0);
									}, false);

							e.preventDefault();
						}
					}
				});
	});
}

function backToTop() {
	jQuery(document).ready(
			function($) {
				// browser window scroll (in pixels) after which the "back to
				// top" link is shown
				var offset = 300,
				// browser window scroll (in pixels) after which the "back to
				// top" link opacity is reduced
				offset_opacity = 1200,
				// duration of the top scrolling animation (in ms)
				scroll_top_duration = 700,
				// grab the "back to top" link
				$back_to_top = $('.cd-top');

				// hide or show the "back to top" link
				$(window).scroll(
						function() {
							($(this).scrollTop() > offset) ? $back_to_top
									.addClass('cd-is-visible') : $back_to_top
									.removeClass('cd-is-visible cd-fade-out');
							if ($(this).scrollTop() > offset_opacity) {
								$back_to_top.addClass('cd-fade-out');
							}
						});

				// smooth scroll to top
				$back_to_top.on('click', function(event) {
					event.preventDefault();
					$('body,html').animate({
						scrollTop : 0,
					}, scroll_top_duration);
				});

			});

}

function backbutton() {
	window.onload = function() {
		if (typeof history.pushState === "function") {
			history.pushState("jibberish", null, null);
			window.onpopstate = function() {
				history.pushState('newjibberish', null, null);
				window.location.href = document.referrer;
				// Handle the back (or forward) buttons here
				// Will NOT handle refresh, use onbeforeunload for this.
			};
		} else {
			var ignoreHashChange = true;
			window.onhashchange = function() {
				if (!ignoreHashChange) {
					ignoreHashChange = true;
					window.location.hash = Math.random();
					// Detect and redirect change here
					// Works in older FF and IE9
					// * it does mess with your hash symbol (anchor?) pound sign
					// delimiter on the end of the URL
				} else {
					ignoreHashChange = false;
				}
			};
		}
	}
}

function reRenderPage(append, resetPageInUrl) {

	if (resetPageInUrl) {
		replaceRequestParameter("page", 0);
	}

	getRefiners(append, resetPageInUrl);
}

function getProducts(append) {

	var excludeSoldOut = parseInt(0);
	if ($('#exclude_sold_out').is(":checked")) {
		excludeSoldOut = parseInt(1);
	}

	console.log("getProducts and append " + append);

	var page = getRequestParam("page");

	if (isEmptyContent(page)) {
		page = 0;
	}

	$.ajax({
		url : "/product/findProducts?page=" + page + "&includeSoldOut="
				+ excludeSoldOut,
		method : 'POST',
		contentType : "application/json; charset=utf-8",
		data : getInput(),
		beforeSend : function() {
			$('#loading').show();
		},
		complete : function() {
			$('#loading').hide();
		},
		success : function(data) {
			renderProducts(data, append);
		}
	});
}

function renderProducts(data, append) {

	$("#products_size").val(data.length);
	$("#product_count").html(data.length);

	if (data != null && data.length > 0 && !isEmptyContent(data)) {

		var all_products = "";

		for (i = 0; i < data.length; i++) {
			var pid = data[i].pid;
			var id = data[i].id;
			var name = data[i].name;
			var shortName = data[i].shortName;
			var image = data[i].listingImage;
			var price = data[i].price;
			var actualPrice = data[i].actualPrice;
			var discount = data[i].discount;
			var isAtleastOneSizeHasStock = data[i].isAtleastOneSizeHasStock;

			var discountInfo = '<span class="offer_price">(' + discount
					+ '% OFF)</span>';

			if (discount == null) {
				discountInfo = '&nbsp;';
			}

			var image = '<img class="img-responsive" src="' + image + '" alt="'
					+ name + '">';

			if (isAtleastOneSizeHasStock === false) {
				image = '<div class="img__wrapper">'
						+ image
						+ '<a class="sold_out" target="_blank" href="/product?id='
						+ pid + '">Sold out</a></div>';
			}

			console.log("isAtleastOneSizeHasStock " + isAtleastOneSizeHasStock);

			$("#previous_href").val(window.location.href);

			console.log("window.previous_href = " + $("#previous_href").val()
					+ " and previous_page " + $("#previous_page").val());

			all_products += '<div class="col-xs-12 col-sm-6 col-md-4 padding-left0"><div class="pro-box"><div class="pro-img"><a target="_blank" href="/product?id='
					+ pid
					+ '">'
					+ image
					+ '</a></div><div class="pro-bottom"><div class="row margin-0"><div style="width:100%;" class="col-xs-7 col-sm-8 col-md-6 padding-0"><div class="price_info"><span class="price">&#8377;'
					+ price
					+ '</span> <span class="actual_price">&#8377;'
					+ actualPrice
					+ '</span>&nbsp;&nbsp;'
					+ discountInfo
					+ '</div></div><div style="width:100%; text-align:left;color:grey;" class="col-xs-5 col-sm-6 col-md-6 padding-0 text-right">'
					+ name.substring(0, 24)
					+ '...</div></div></div></div></div></div>';

		}
		if (append === true) {
			$('#products_container').append(all_products);
		} else {
			$('#products_container').html(all_products);
		}

	} else {
		if (append === false) {
			$('#products_container')
					.html(
							'<h4>Oops.. No products found. We\'re working on filling our store. Please checkback later.</h4>');
		}
	}

	// $('#loading_bottom').hide();

	if ($("#products_size").val() > 0) {
		$('#load_more').show();
	}

	// $.fn.raty.defaults.path = 'resources/assets/products/images';
	// assignRating(data);

}

function assignRating(data) {
	if (data != null && data.length > 0) {
		for (i = 0; i < data.length; i++) {
			var id = data[i].id;
			var rating = data[i].rating;
			$('#rating' + id).raty({
				readOnly : true,
				score : rating
			});
		}
	}
}

// refiner related method starts here
function getSelectedRefiners() {
	var checkedBoxes = [ "-1" ];
	$("input[name=refiner_checkboxes]:checked").map(
			function() {
				var label = $("label[for='" + this.id + "']").text();
				var value = label + SPLIT_CHAR_ATTRIBUTES
						+ getFirstValueFromId(this.id);
				checkedBoxes.push(value);
			});

	return checkedBoxes;
}

function getFirstValueFromId(id) {
	var ids = id.split(JOIN_CHAR);
	return ids[0];
}

function makeSelectedFromParam() {

	var param = getRequestParam(ATTRIBUTES);
	var refiners = param.split(",");

	$('#sort_div_left').empty();

	$("input[name=refiner_checkboxes]").each(function(index, element) {
		for (i = 0; i < refiners.length; i++) {
			if (isSameAttribute(refiners[i], element.id)) {
				$(this).prop('checked', true);
				addButtons(element.name, element.id);
			}
		}
	});
}

function clearAllRefiners() {
	$("#clear_all_anchor").click(function(e) {
		e.preventDefault();
		$("input[name=refiner_checkboxes]").each(function(index, element) {
			$(this).prop('checked', false);
		});

		$("#price_textbox_min").val("");
		$("#price_textbox_max").val("");

		reRenderRefinersOnChangeOfCheckBox();

	});
}

function reRenderRefinersOnChangeOfCheckBox() {
	replaceRequestParameterForCheckBoxes(ATTRIBUTES, getSelectedRefiners());
	getProductsOnRefinerChange();
	setOnChange();
}

function addButtons(name, id) {

	var isColorRefiner = false;

	if (id.indexOf("COLOR") !== -1) {

		var productId = id.replace(/COLOR/g, '');

		if ($.isNumeric(productId)) {
			isColorRefiner = true;
		} else {
			// it is not a COLOR attribute, it is something else. Note it
			// your honor
		}
	}

	var buttonId = 'button' + getLabelText(id) + SPLIT_CHAR_ATTRIBUTES
			+ getFirstValueFromId(id);

	var exists = false;

	$('button', $('#sort_div_left')).each(function() {
		if ($(this).prop("id") == buttonId) {
			exists = true;
			return;
		}
	});

	if (exists == false) {

		var labelText = getLabelText(id);

		if (isColorRefiner) {
			$('#sort_div_left')
					.append(
							'<button type="button" style="text-align:left;background-color:#'
									+ labelText
									+ ';min-width:15%;border-color:#'
									+ labelText
									+ ';color:black'
									+ '" onclick="buttonClick(\''
									+ buttonId
									+ '\')" class="btn btn-primary btn-xs refiner_buttons" id="'
									+ buttonId
									+ '"><span class="glyphicon glyphicon-remove"></span>'
									+ '&nbsp; </button>');
		} else {
			$('#sort_div_left')
					.append(
							'<button type="button" onclick="buttonClick(\''
									+ buttonId
									+ '\')" class="btn btn-primary btn-xs refiner_buttons" id="'
									+ buttonId
									+ '"><span class="glyphicon glyphicon-remove"></span>'
									+ labelText + ' </button>');
		}
	}
}

function buttonClick(id) {
	var button = id.replace('button', '');
	$("input[name=refiner_checkboxes]").each(function(index, element) {
		if (isSameAttribute(button, element.id)) {
			$(this).prop("checked", false);
		}
	});

	replaceRequestParameterForCheckBoxes(ATTRIBUTES, getSelectedRefiners());
	getProductsOnRefinerChange();
	// highlightCheckBoxes();
}

function isSameAttribute(param, checkboxId) {
	var label = getLabelText(checkboxId);
	var attr = label + SPLIT_CHAR_ATTRIBUTES + getFirstValueFromId(checkboxId);

	var isSame = attr === param;
	return isSame;
}

function getLabelText(id) {
	var label = $("label[for='" + id + "']").text();
	return label;
}

function highlightCheckBoxes() {
	makeSelectedFromParam();
}

function getProductsOnRefinerChange() {
	// highlightCheckBoxes();
	reRenderPage(false, true);
}

function getIdsOfCheckboxes(names) {

	var selectedAttributesId = [];

	$("input[name=refiner_checkboxes]").each(function(index, element) {
		for (i = 0; i < names.length; i++) {
			if (isSameAttribute(names[i], element.id)) {
				selectedAttributesId.push(element.value);
			}
		}
	});

	return selectedAttributesId;
}

function getInput() {

	var param = getRequestParam(ATTRIBUTES);
	var attributeIds = param.split(",");
	var ids = "-1";

	if (attributeIds[0].indexOf("-1") > -1 && attributeIds.length <= 1) {
	} else {
		ids = getIdsOfCheckboxes(attributeIds).join(",");
	}

	var categoryIds = getRequestParam(CHILD_CATEGORIES);

	var numericAttributeIds = ids.split(',').map(function(s) {
		return Number(s);
	});

	var numericCategoryIds = categoryIds.split(',').map(function(s) {
		return Number(s);
	});

	var minPrice = $("#price_textbox_min").val();
	var maxPrice = $("#price_textbox_max").val();

	if (!$.isNumeric(minPrice)) {
		minPrice = null;
	}

	if (!$.isNumeric(maxPrice)) {
		maxPrice = null;
	}

	var input = {
		categoryIds : numericCategoryIds,
		attributeIds : numericAttributeIds,
		sort : getRequestParam(SORT),
		minPrice : minPrice,
		maxPrice : maxPrice
	};

	input = JSON.stringify(input);
	return input;
}

function getRefiners(append) {

	swapPrice();

	$.ajax({
		url : "/product/findRefiners",
		method : 'POST',
		contentType : "application/json; charset=utf-8",
		data : getInput(),
		beforeSend : function() {
			$('#loader-icon_left').show();
			$('#loading_bottom').show();
			$('#load_more').hide();
			$('#left_block').addClass("disable");
			$('#left_block :input').prop('disabled', 'true');
		},
		complete : function() {
			$('#loader-icon_left').hide();
			/*
			 * $('#loading_bottom').hide(); $('#load_more').show();
			 */
			$('#left_block').removeClass("disable");
			// $('#left_block').addClass("enable");
			$('#left_block :input').removeProp('disabled');
		},
		success : function(data) {
			renderRefiners(append, data);
		}
	});
}

function renderRefiners(append, filters) {

	// on click of sorting it prevents accordion append
	var isOnchange = $("#onchange_refiner_checkboxes").val();

	var $template = $(".template");

	var hash = 1;

	var refiners = filters.refiners;

	var minPrice = filters.minPrice;
	var maxPrice = filters.maxPrice;

	if (minPrice === undefined) {
		minPrice = 0;
	}

	if (maxPrice === undefined) {
		maxPrice = 0;
	}

	$("#price_textbox_min").attr("placeholder", "Rs." + minPrice);
	$("#price_textbox_max").attr("placeholder", "Rs." + maxPrice);

	if (refiners != null && refiners.length > 0) {

		for (i = 0; i < refiners.length; ++i) {

			var refiner = refiners[i];

			var attributes = refiner.uniqueAttributes;

			var checkboxes = "";

			// if no child element found do not include to accordion
			var isRefinerNameAppended = false;
			if (attributes != null && attributes.length > 0) {

				for (j = 0; j < attributes.length; ++j) {

					var attribute = attributes[j];

					var idAndValue = changeCommaSeparatedToHashSeparated(
							attribute.attributeIds, refiner.name);
					var checkboxLabel = "";

					var colorstyle = '#323a3d';
					var backgroundcolorstyle = 'white';
					// alert(refiner.name.toLowerCase() + ", " +
					// attribute.value);
					if (refiner.name.toLowerCase() === 'color') {
						colorstyle = attribute.value.toLowerCase();
						backgroundcolorstyle = attribute.value.toLowerCase();
					}

					console.log("color style is " + colorstyle);

					var style = ' style="width:50%; color:' + colorstyle
							+ '; background:' + backgroundcolorstyle + ';" ';

					var checkbox = '<div class="checkbox"><input name="refiner_checkboxes" type="checkbox" onchange="reRenderRefinersOnChangeOfCheckBox();" value="'
							+ attribute.attributeIds
							+ '" id="'
							+ idAndValue
							+ '"><label '
							+ style
							+ ' for="'
							+ idAndValue
							+ '">' + attribute.value + '</label> </div>';

					if (attribute.value === 'NA') {
						// DO NOT include if size is NA (bcz it's only for
						// sarees)
						continue;
					}

					isRefinerNameAppended = true;
					checkboxes += checkbox;
				}
			}

			console.log("isRefinerNameAppended " + isRefinerNameAppended);
			if (isOnchange == '0' && isRefinerNameAppended === true) {

				var camelCaseRefinerName = toTitleCase(refiner.name);

				var $newPanel = $template.clone();
				$newPanel.find(".collapse").removeClass("in");
				$newPanel.find(".accordion-toggle")
						.attr("href", "#" + (++hash))
						.text(camelCaseRefinerName);
				$newPanel.find(".panel-collapse").attr("id", hash).addClass(
						"collapse").removeClass("in");
				$("#accordion").append($newPanel.fadeIn());

				$newPanel.find(".panel-body").html(checkboxes);
			}

		}
	}

	// make checkbox checked or unchecked based on onchange checkbox
	highlightCheckBoxes();

	getProducts(append);

	if (isOnchange === '1') {

		$("#previous_page").val($("#previous_href").val());
		$("#onchange_refiner_checkboxes").val(0);

		console.log("prev page = " + $("#previous_page").val());
	}

}

function setOnChange() {
	$("#onchange_refiner_checkboxes").val(1);
	console.log($("#onchange_refiner_checkboxes").val());
}

function toTitleCase(str) {
	var lcStr = str.toLowerCase();
	return lcStr.replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

function changeCommaSeparatedToHashSeparated(attributeIds, refinerName) {
	var comma = attributeIds.sort();
	var value = refinerName + comma.join(JOIN_CHAR);
	return value;
}

// refiner related method ends here

function getCategories() {

	var attributeIds = $('#attribute_ids').val();

	var cat_id = $('#current_cat_id').val();
	if (cat_id === 'null') {
		console.log("yes thats true" + $("#last_cat_id").val());
	}
	console.log("cat_id" + cat_id);
	// last_cat_id
	$
			.ajax({
				url : "/category/getCategory",
				method : 'POST',
				contentType : "application/json; charset=utf-8",
				data : JSON.stringify(cat_id),
				success : function(data) {

					if (data != null && data.breadcrumps != null) {

						replaceRequestParameter(CHILD_CATEGORIES,
								data.childrenIds);

						updateRequestParameter(ATTRIBUTES,
								getRequestParamForAttributes());

						// createRequestParamForSort();

						replaceRequestParameter("page", 0);

						reRenderPage(false, true);

						$('#child_category_ids').val(data.childrenIds);

						var SPACE = " ";

						$("#category_title")
								.html(
										data.breadcrumps[data.breadcrumps.length - 1].name
												+ SPACE);

						for (b = 0; b < data.breadcrumps.length; ++b) {

							var breadcrumb_name = data.breadcrumps[b].name;
							var breadcrumb_id = data.breadcrumps[b].id;

							var breadcrumb = "";

							if (data.name === breadcrumb_name) {
								breadcrumb = breadcrumb + '<li class="active">'
										+ breadcrumb_name + '</li>';
							} else {
								breadcrumb = breadcrumb
										+ '<li><a href="/products/cat/'
										+ breadcrumb_id + '">'
										+ breadcrumb_name + '</a></li>';
							}

							$('#breadcrumb_category').append(breadcrumb);
						}
					}

					if (data == null || data.length <= 0) {
						alert('Could not load category - category does not exists');
						return;
					}

					var parentNodes = [];

					if (data.children != null && data.children.length > 0) {

						for (i = 0; i < data.children.length; ++i) {

							var childrenCategory = data.children[i];

							var grandChildrenNodes = [];

							if (childrenCategory.children != null
									&& childrenCategory.children.length > 0) {

								for (j = 0; j < childrenCategory.children.length; ++j) {

									var greatGreatGrandChildrenNodes = [];

									var greatGreatGrandChildrenCategory = childrenCategory.children[j];

									if (greatGreatGrandChildrenCategory.children != null
											&& greatGreatGrandChildrenCategory.children.length > 0) {

										for (k = 0; k < greatGreatGrandChildrenCategory.children.length; ++k) {

											var greatGreatGreatGrandChildrenCategory = greatGreatGrandChildrenCategory.children[k];
											var greatGreatGrandChildrenCategoryName = "";

											if (greatGreatGreatGrandChildrenCategory != null) {
												greatGreatGrandChildrenCategoryName = greatGreatGreatGrandChildrenCategory.name;
											}

											var lastCategory = {
												text : greatGreatGrandChildrenCategoryName,
												href : 'products?cat='
														+ greatGreatGrandChildrenCategory.id,
												tags : [ '0' ],
												nodes : ""
											}

											greatGreatGrandChildrenNodes
													.push(lastCategory);
										}
									}

									var grandChildrenCategory = childrenCategory.children[j];

									var grandChildrenCategoryName = "";

									if (grandChildrenCategory != null) {
										grandChildrenCategoryName = grandChildrenCategory.name;
									}

									var greatGrandChildrenCategory = {
										text : grandChildrenCategoryName,
										href : 'products?cat='
												+ grandChildrenCategory.id,
										tags : [ '0' ],
										nodes : ""
									}

									greatGrandChildrenCategory.nodes = greatGreatGrandChildrenNodes;

									grandChildrenNodes
											.push(greatGrandChildrenCategory);
								}
							}

							var grandChildrenCategory = {
								text : childrenCategory.name,
								href : '/products?cat=' + childrenCategory.id,
								tags : [ '0' ],
								nodes : ""
							}

							grandChildrenCategory.nodes = grandChildrenNodes;

							parentNodes.push(grandChildrenCategory);
						}

						parentNodes.nodes = grandChildrenNodes;
					}

					var defaultData = [];

					var masterCategory = {
						text : data.name,
						href : '#',
						tags : [ '0' ],
						nodes : ""
					};

					masterCategory.nodes = parentNodes;
					defaultData.push(masterCategory);

					$('#treeview10').treeview({
						color : "#666",
						enableLinks : true,
						data : defaultData
					});

					// console.log("Tree view data initialized..");
				},
				failure : function(error) {
					alert(error);
				}
			});

}

function getRequestParamForAttributes() {
	var attr = getRequestParam(ATTRIBUTES);
	if (isEmptyContent(attr)) {
		return -1;
	}

	return attr;
}

function sort() {

	$("#low_to_high").click(function(e) {
		e.preventDefault();
		changeSortRequestParameter("Price: Low To High");
		makeLowToHighActive();
	});

	$("#high_to_low").click(function(e) {
		e.preventDefault();
		changeSortRequestParameter("Price: High To Low");
		makeHighToLowActive();
	});

	$("#popular").click(function(e) {
		e.preventDefault();
		changeSortRequestParameter("What's New");
		makePopularActive();
	});

	createRequestParamForSort();

}

function makeLowToHighActive() {
	$("#high_to_low").removeClass("active");
	$("#popular").removeClass("active");
	$("#low_to_high").addClass("active");
}

function makeHighToLowActive() {
	$("#low_to_high").removeClass("active");
	$("#popular").removeClass("active");
	$("#high_to_low").addClass("active");
}

function makePopularActive() {
	$("#low_to_high").removeClass("active");
	$("#high_to_low").removeClass("active");
	$("#popular").addClass("active");
}

function changeSortRequestParameter(text) {
	replaceRequestParameter(SORT, text);
	setOnChange();
	reRenderPage(false, true);

}

function createRequestParamForSort() {
	var sort = getRequestParam(SORT);
	if (isEmptyContent(sort)) {
		replaceRequestParameter(SORT, "Price: Low To High");
		makeLowToHighActive();
	} else {
		if (sort === "Price: Low To High") {
			makeLowToHighActive();
		} else if (sort === "Price: High To Low") {
			makeHighToLowActive();
		} else if (sort === "What's New") {
			makePopularActive();
		}
	}
}

function swapSort(sort) {
	$('a', $('#sort_by')).each(function() {
		var matches = false;
		if ($(this).text().indexOf(sort) > -1) {
			matches = true;
		}
		var currentAnchor = $(this).text();
		var first = $("#dLabel").text();
		if (matches === true) {
			$(this).text(first);
			$("#dLabel").text(currentAnchor);
		}
	});
}

function search() {

}

function postToDetail(id) {
	/*
	 * console.log("id sent is " + id); var input = '<input type="hidden"
	 * name="productId" value="' + id + '" />'; $("body").append( '<form
	 * target="_blank" action="product" method="get" id="product_">' + input + '</form>');
	 * $("#product_").submit();
	 */

}

function login() {

	$("#login_button").click(function(e) {
		$.ajax({
			url : "/login",
			method : 'POST',
			contentType : "application/json",
			data : getLoginInput(),
			success : function(data) {
				var message = "";
				if (data === "notregistered") {
					message = "You are not registered with us. Please signup."
				} else if (data === "false") {
					message = "Invalid credentials. Please try again."
				} else if (data == "true") {
					window.location = window.location.href;
				} else if (data == "admin") {
					window.location = "addproducts";
				}
				$("#login_failed_message").html(message);
			}
		});
	});
}

function getLoginInput() {
	var login = {
		emailOrMobile : $("#emailOrMobile").val(),
		password : $("#password").val()
	}

	return JSON.stringify(login);
}

/** uTILITY METHODS * */
function updateRequestParameter(key, value) {

	console.log("key = " + key + " value = " + value);

	var url = window.location.href;
	var attributes = getRequestParam(key);

	var attributesParam = "";

	var updatedValue = value;

	if (isEmptyContent(attributes)) {
		var updatedUrl = url + '&' + key + '=' + value;
		ChangeUrl(url, updatedUrl);

	}
}

function replaceRequestParameter(key, value) {

	console.log("replaceRequestParameter key = " + key + " value = " + value);

	var url = window.location.href;
	var updatedUrl = updateQueryStringParameter(url, key, value);

	ChangeUrl(url, updatedUrl);
}

function replaceRequestParameterForCheckBoxes(key, value) {

	if (isEmptyContent(value)) {
		replaceRequestParameter(ATTRIBUTES, -1);
		return;
	}

	var url = window.location.href;
	var updatedUrl = updateQueryStringParameter(url, key, value);
	ChangeUrl(url, updatedUrl);
}

function ChangeUrl(page, url) {
	if (typeof (history.pushState) != "undefined") {
		var obj = {
			Page : page,
			Url : url
		};
		history.pushState({}, null, obj.Url);
	} else {
		window.location.href = "homePage";
		alert("Browser does not support HTML5.");
	}
}

function isDuplicateValue(attributes, value) {
	var values = attributes.split("--");
	for (i = 0; i < values.length; i++) {
		if (values[i] === value) {
			return true;
		}
	}
	return false;
}

function updateQueryStringParameter(uri, key, value) {
	var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)", "i");
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	} else {
		var hash = '';
		if (uri.indexOf('#') !== -1) {
			hash = uri.replace(/.*#/, '#');
			uri = uri.replace(/#.*/, '');
		}
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		return uri + separator + key + "=" + value + hash;
	}
}

function isEmptyContent(str) {
	return (!str || 0 === str.length);
}

function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}

function getRequestParam(name) {
	if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)'))
			.exec(location.search))
		return decodeURIComponent(name[1]);
}

function removeRequestParameterValueOnly(key, value) {

	var updatedArray = [];
	var param = getRequestParam(key);
	if (!isEmptyContent(param)) {
		var values = param.split(SPLIT_CHAR);
		for (i = 0; i < values.length; i++) {
			if (parseInt(values[i]) === parseInt(value)) {

			} else {
				updatedArray.push(values[i]);
			}
		}
	} else {
		alert('Could not remove non-existing request parameter');
	}

	replaceRequestParameter(ATTRIBUTES, updatedArray);

	return updatedArray;
}

function removeRequestParameter(parameter) {
	url = window.location.href;
	var urlparts = url.split('?');

	if (urlparts.length >= 2) {
		var urlBase = urlparts.shift(); // get first part, and remove from array
		var queryString = urlparts.join("?"); // join it back up

		var prefix = encodeURIComponent(parameter) + '=';
		var pars = queryString.split(/[&;]/g);
		for (var i = pars.length; i-- > 0;)
			// reverse iteration as may be destructive
			if (pars[i].lastIndexOf(prefix, 0) !== -1) // idiom for
				// string.startsWith
				pars.splice(i, 1);
		url = urlBase + '?' + pars.join('&');
	}
	return url;
}

function loadMore() {

	// if products found then only scroll
	if ($("#products_size").val() > 0) {

		var page = getRequestParam("page");
		replaceRequestParameter("page", ++page);
		$(window).data('ajaxready', true);

		reRenderPage(true, false);
	} else {
		$('#load_more').hide();
	}
}

function price() {
	$('#price_textbox_max').on('keypress', function(event) {
		if (event.which === 13) {
			reRenderPage(false, true);
		}
	});

	$('#price_go_button').on('keypress', function(event) {
		if (event.which === 13) {
			reRenderPage(false, true);
		}
	});

	$('#price_go_button').on('click', function(event) {
		reRenderPage(false, true);
	});

	$('.price_clear').on('click', function(event) {
		$("#price_textbox_min").val("");
		$("#price_textbox_max").val("");

	});
}

function swapPrice() {
	var minPrice = $("#price_textbox_min").val();
	var maxPrice = $("#price_textbox_max").val();

	if (minPrice > maxPrice) {
		$("#price_textbox_min").val(maxPrice);
		$("#price_textbox_max").val(minPrice);
	}
}