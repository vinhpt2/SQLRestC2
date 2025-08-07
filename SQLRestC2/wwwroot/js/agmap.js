export class AGMap {
	static token = null;
	static map = null;
	static service = null;
	static view = null;
	static layers = {};
	static extent = null;
	static backStack = [];
	static nextStack = [];
	static grids = {};
	static callback=null;
	static SYMBOL={
		extent:{type: "simple-fill",style: "none",outline: { color: "black", width: 1 }},
		point:{type: "simple-marker",style: "cross",color: "orange",size: 10,outline: { color: "orange", width: 2 }},
		polyline:{type: "simple-line", color: "orange", width: 2 },
		polygon:{type: "simple-fill",style: "none",outline: { color: "orange", width: 2 }},
		circle:{type: "simple-fill",style: "none",outline: { color: "lime", width: 1 }}
	}
	constructor(para) {
		NUT.loading(para.divMap);
		AGMap.service = para.service;
		AGMap.div = para.divMap;
		document.head.z(["script", {
			src: "https://js.arcgis.com/4.33/", onload: function () {
				require(["esri/config", "esri/identity/IdentityManager","esri/Map", "esri/WebMap", "esri/views/MapView", "esri/views/draw/Draw", "esri/Graphic", "esri/symbols/support/symbolUtils", "esri/widgets/Editor", "esri/widgets/Measurement", "esri/widgets/Print", "esri/widgets/Locate", "esri/widgets/BasemapGallery", "esri/widgets/ScaleBar", "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/geometry/geometryEngine", "esri/geometry/support/webMercatorUtils", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/Circle", "esri/layers/GraphicsLayer", "esri/geometry/Multipoint"], function (esriConfig, esriId, Map, WebMap, MapView, Draw, Graphic, symbolUtils, Editor, Measurement, Print, Locate, BasemapGallery, ScaleBar,LayerList, FeatureLayer, geometryEngine, webMercatorUtils,Extent, Point, Polyline,Polygon, Circle,GraphicsLayer, Multipoint) {
					AGMap.Map=Map;
					AGMap.MapView=MapView;
					AGMap.Graphic = Graphic;
					AGMap.FeatureLayer=FeatureLayer;
					AGMap.symbolUtils = symbolUtils;
					AGMap.Editor = Editor;
					AGMap.geometryEngine = geometryEngine;
					AGMap.webMercatorUtils = webMercatorUtils;
					AGMap.Point = Point;
					AGMap.Polyline = Polyline;
					AGMap.Polygon = Polygon;
					AGMap.Polygon = Circle;
					AGMap.GraphicsLayer=GraphicsLayer;
					AGMap.Multipoint=Multipoint;
					var items=[
						{ type: 'radio', id: "pan", group: 1, icon: "hand-png", tooltip: "_Pan" },
						{ type: 'break' },
						{ type: 'radio', id: "identify", group: 1, icon: "info-png", tooltip: "_Identify" },
						{ type: 'radio', id: "select", group: 1, icon: "select-png", tooltip: "_Select" },
						{ type: 'button', id: "unselect", icon: "unselect-png", tooltip: "_ClearSelect" },
						{ type: 'break' },
						{ type: 'radio', id: "measure", group: 1, icon: "ruler-png", tooltip: "_Measure" },
						{ type: 'button', id: "basemap", icon: "basemap-png", tooltip: "_Basemap" },
						{ type: 'button', id: "print", icon: "printer-png", tooltip: "_Print" },
						{ type: 'break' },
						{ type: 'button', id: "fullextent", icon: "world-png", tooltip: "_FullExtent" }
					];

					(NUT.w2ui["tbrMap"] || new NUT.w2toolbar({
						name: "tbrMap",
						items: NUT.isMobile?items: [{ type: 'radio', id: "zoomin", group: 1, icon: "zoomin-png", tooltip: "_ZoomIn" },{ type: 'radio', id: "zoomout", group: 1, icon: "zoomout-png", tooltip: "_ZoomOut" }].concat(items).concat([{ type: 'button', id: "backextent", icon: "back-png", tooltip: "_BackExtent" },{ type: 'button', id: "nextextent", icon: "next-png", tooltip: "_NextExtent" }]),
						onClick(evt) {
							AGMap.tool = evt.object.id;
							AGMap.view.popupEnabled = (AGMap.tool == "identify");
							var style = AGMap.view.container.style;
							var action = null;
							switch (AGMap.tool) {
								case "pan":
									style.cursor = "grab";
									AGMap.draw.reset();
									break;
								case "point":
								case "polyline":
								case "polygon":
								case "circle":
									style.cursor = "crosshair";
									action = AGMap.draw.create(AGMap.tool);
									break;
								case "identify":
									style.cursor = "help";
									AGMap.draw.reset();
									break;
								case "zoomin":
									style.cursor = "zoom-in";
									action = AGMap.draw.create("rectangle");
									break;
								case "zoomout":
									style.cursor = "zoom-out"
									action = AGMap.draw.create("rectangle");
									break;
								case "select":
									style.cursor = "default";
									action = AGMap.draw.create("rectangle");
									break;
								case "unselect":
									for(var key in AGMap.layers)if(AGMap.layers.hasOwnProperty(key)){
										var layer=AGMap.layers[key];
										if(layer.highlight)layer.highlight.remove();
									}
									AGMap.view.graphics.removeAll();
									break;
								case "fullextent":
									AGMap.view.goTo(n$.windowid ? AGMap.extent.expand(0.5) : AGMap.extent);
									break;
								case "backextent":
									var ext = AGMap.backStack.pop();
									if (ext) {
										AGMap.skipme = true;
										AGMap.nextStack.push(AGMap.view.extent);
										AGMap.view.goTo(ext);
									}
									break;
								case "nextextent":
									var ext = AGMap.nextStack.pop();
									if (ext) {
										AGMap.skipme = true;
										AGMap.view.goTo(ext);
									}
									break;
								case "measure":
									var a = NUT.createWindowTitle("measure", divTitle);
									var widget = new Measurement({
										container: a.div,
										view: AGMap.view,
										activeTool: "distance"
									});
									widget.renderNow();
									a.innerHTML = "Measure";
									break;
								case "basemap":
									var a = NUT.createWindowTitle("basemap", divTitle);
									var widget = new BasemapGallery({
										container: a.div,
										view: AGMap.view
									});
									widget.renderNow();
									a.innerHTML = "Basemap";
									break;
								case "print":
									var a = NUT.createWindowTitle("print", divTitle);
									var widget = new Print({
										container: a.div,
										view: AGMap.view,
										printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
									});
									widget.renderNow();
									a.innerHTML = "Print";
									break;
							}
							if (action) {
								action.on("cursor-update", function (evt) {
									var p = evt.vertices;
									if(p.length>=2){
										var lyr = AGMap.view.graphics;
										var g = lyr.getItemAt(0);
										var isPoly=(AGMap.tool=="polyline"||AGMap.tool=="polygon");
										var geom = isPoly?{
											type: AGMap.tool,
											rings:[p],
											paths:[p]
										}:(AGMap.tool=="circle"?new Circle({
											center:{type:"point",x:p[0][0],y:p[0][1],spatialReference:AGMap.view.spatialReference},
											radius:Math.sqrt((p[0][0]-p[1][0])*(p[0][0]-p[1][0])+(p[0][1]-p[1][1])*(p[0][1]-p[1][1]))
										}):{
											type: "extent",
											xmin: p[0][0], ymin: p[0][1], xmax: p[1][0], ymax: p[1][1]
										});
										geom.spatialReference=AGMap.view.spatialReference;
										var symb=AGMap.SYMBOL[isPoly?AGMap.tool:"extent"];

										if (g) {
											g.geometry = geom;
											g.symbol=symb;
										}else lyr.add({geometry: geom,symbol:symb});
									}
								});
								action.on("draw-complete", function (evt) {
									AGMap.view.graphics.removeAll();
									var isGeom=AGMap.tool=="point"||AGMap.tool=="polyline"||AGMap.tool=="polygon";
									var p=evt.vertices;
									var geom=null;
									if(AGMap.tool=="circle")geom=new Circle({center:{type:"point",x:p[0][0],y:p[0][1],spatialReference:AGMap.view.spatialReference},radius:Math.sqrt((p[0][0]-p[1][0])*(p[0][0]-p[1][0])+(p[0][1]-p[1][1])*(p[0][1]-p[1][1]))});
									else geom=isGeom?(AGMap.tool=="point"?{type: AGMap.tool,x:p[0][0],y:p[0][1]}:{type: AGMap.tool,paths:[p],rings:[p]}):new Extent({type: "extent",xmin: p[0][0], ymin: p[0][1], xmax: p[1][0], ymax: p[1][1]});
									geom.spatialReference=AGMap.view.spatialReference;
									switch (AGMap.tool) {
										case "point":
										case "polyline":
										case "polygon":
										case "circle":
											AGMap.view.graphics.add({
												geometry: geom,
												symbol: AGMap.SYMBOL[AGMap.tool]
											});
											if(AGMap.callback)AGMap.callback({geometry:geom,vertices:evt.vertices});
											break;
										case "zoomin":
											AGMap.view.goTo(geom);
											break;
										case "zoomout":
											AGMap.view.goTo(geom.expand(AGMap.view.extent.width / geom.width + AGMap.view.extent.height / geom.height));
											break;
										case "select":
											style.cursor = "default";
											action = AGMap.draw.create("rectangle");
											AGMap.view.allLayerViews.forEach(function (lyrView) {
												var layer = lyrView.layer;
												var where = [];
												var selectable = layer.selectable;
												if (layer.type == "subtype-group") {
													for (var i = 0; i < layer.sublayers.length; i++) {
														var slyr = layer.sublayers.getItemAt(i);
														if (slyr.selectable) where.push((slyr.subtypeField||"ASSETGROUP") + "=" + slyr.subtypeCode);
													}
													selectable = where.length;
												}
												if (selectable) {
													var query = {
														geometry: {
															type: "polygon",
															rings: [[[geom.xmin, geom.ymin], [geom.xmin, geom.ymax], [geom.xmax, geom.ymax], [geom.xmax, geom.ymin], [geom.xmin, geom.ymin]]],
															spatialReference: geom.spatialReference
														}
													}
													if (where) query.where = where.join(" or ");
													lyrView.queryObjectIds(query).then(function (oid) {
														if (layer.highlight) layer.highlight.remove();
														layer.highlight = lyrView.highlight(oid);
														layer.highlight.oid = oid;
														var grid = AGMap.grids[layer.id];
														if (grid) {
															grid.selectNone(true);
															var conf = grid.box.parentNode.parentNode.tag;
															NUT.NWin.switchFormGrid(conf, grid.select(oid) == 1);
														}
													});
												}
											});
											break;
									}
									
									NUT.w2ui["tbrMap"].onClick({object:{id:AGMap.tool}});
								})
							}
						}
					})).render(AGMap.div.nextSibling);
					AGMap.generateToken(AGMap.service,function(res){
						if (res.error) NUT.notify("🛑 ERROR: " + res.error.message, "red");
						else {
							AGMap.token=AGMap.service.iscredential?res.access_token:res.token;
							esriId.registerToken({ server: AGMap.service.urlPortal, token: AGMap.token });
							esriConfig.portalUrl = AGMap.service.urlPortal;

							AGMap.map = new WebMap({
								portalItem: { id: AGMap.service.itemId },
								basemap: "topo-vector"
							});
							AGMap.map.load().then(function () {
								AGMap.view = new MapView({
									container: AGMap.div,
									map: AGMap.map,
									popupEnabled: false,
									ui: { components: ["zoom"] },
									constraints: { lods: [] }
								});
								AGMap.draw = new Draw({ view: AGMap.view });
								AGMap.view.ui.add("compass","top-right");
								AGMap.view.ui.add(new Locate({view:AGMap.view}),"top-right");
								if (NUT.isMobile) AGMap.view.ui.move("zoom", "top-right");

								AGMap.initMap();
							}).catch(function (err) {
								NUT.notify("🛑 " + err, "red");
							});
						}
					});
					
				});
			}
		}]);
	}
	static generateToken(service,callback){
		var url = service.url.split("home/item.html?id=");
		service.urlPortal=url[0];
		service.itemId=url[1];
		if(service.iscredential)NUT.AGMap.post({ url: service.urlPortal + "sharing/rest/oauth2/token?f=json&grant_type=client_credentials&client_id="+service.accessuser+"&client_secret="+service.accesspass+ "&referer=" + location.origin }, callback);
		else NUT.AGMap.submit({ url: service.urlPortal + "sharing/rest/generateToken?f=json&client=referer&referer=" + location.origin,data:{username:service.accessuser,password:service.accesspass}}, callback);
	}
	static refreshToken(callback) {
		AGMap.token=null;
		NUT.AGMap.post({ url: AGMap.service.urlPortal + "sharing/rest/oauth2/token?f=json&grant_type=client_credentials&client_id=" + AGMap.service.accessuser + "&client_secret=" + AGMap.service.accesspass + "&referer=" + location.origin }, function (res) {
			if (res.error) NUT.notify("🛑 ERROR: " + res.error.message, "red");
			else {
				//AGMap.token = res.access_token;
				callback(res.access_token);
			}
		});
	}
	static initMap () {
		NUT.loading();
		var mnuMain=NUT.w2ui["mnuMain"];
		for (var i = 0; i < AGMap.map.allLayers.length; i++) {
			var lyr = AGMap.map.allLayers.getItemAt(i);
			lyr.selectable = 0;
			if (lyr.type == "feature") {
				lyr.outFields = "*";
				AGMap.layers[lyr.id] = lyr;
			}
			if (lyr.type == "subtype-group") {
				lyr.selectable = 1;
				for (var j = 0; j < lyr.sublayers.length; j++) {
					var slyr = lyr.sublayers.getItemAt(j);
					slyr.selectable = 0;
					AGMap.layers[slyr.id] = slyr;
				}
				//add submenu
				var parent = mnuMain.get(lyr.id);
				//parent.group = !NUT.isMobile;
				parent.expanded = !NUT.isMobile && parent.isopen;
				var nodes = [];
				for (var j = lyr.sublayers.length - 1; j >= 0; j--) {
					var slyr = lyr.sublayers.getItemAt(j);
					var node={id: slyr.id, maplayer: slyr.id, where: [slyr.subtypeField, "=", slyr.subtypeCode], tag: parent.tag, layerTitle: slyr.title, text:slyr.title+"<input type='checkbox' style='float:left' name='" + node.id + "' onclick='event.stopPropagation();NUT.AGMap.layers[this.name].visible=this.checked'"+(slyr.visible?+" checked/>":"/>")};
					nodes.push(node);
				}
				mnuMain.insert(parent.id, null, nodes);
			}
		}
		var lyr = new AGMap.GraphicsLayer({id:'LYR_GRAPHICS'});
		AGMap.map.add(lyr);
		NUT.AGMap.layers[lyr.id] = lyr;
		
		AGMap.extent = AGMap.view.extent;
		AGMap.view.watch("stationary", function (oldVal, newVal) {
			if (newVal) {
				if (AGMap.skipme) AGMap.skipme = false;
				else AGMap.backStack.push(AGMap.view.extent);
			}
		});
		
		_txttopsearch.onchange=function(){
			if(this.value)NUT.AGMap.zoomToCoords([this.value.split(",")] ,"point");
		}
		
		mnuMain.onExpand=function(evt) {
			var id=evt.object.id;
			var lyr = AGMap.layers[id];
			var menu=NUT.w2ui.mnuMain.get(id);
			if(lyr){
				var flat=this.flat;
				var opt={size:(flat?12:16)};
				switch (lyr.renderer.type) {
					case "simple":
						if(menu.nodes.length==0){
							AGMap.symbolUtils.renderPreviewHTML(lyr.renderer.symbol, opt).then(function(res){
								var nodes=[{id: id+"_0", maplayer: id, tag: menu.tag, text:"&nbsp;", icon: res }];
								NUT.w2ui.mnuMain.insert(id, null, nodes);
								if(flat)evt.object.items=nodes;
							});
						}
						
						break;
					case "unique-value":
						if(menu.nodes.length==1){
							var nodes=[];
							AGMap.htmlSymbolNodes(lyr.renderer,nodes,opt,function(){
								for (var i = 0; i < nodes.length; i++) {
									var node=nodes[i];
									node.id=id+"_"+i;
									node.maplayer=id;
									node.tag=menu.tag;
								}
								NUT.w2ui.mnuMain.insert(id, null, nodes);
								if(flat)evt.object.items=nodes;
							});
						}
						break;
				}
			}
			event.stopPropagation();
		}
		mnuMain.handle={
			width:4,
			text:function(node){
				var handle="";
				var lyr=AGMap.layers[node.maplayer];
				if(lyr&&node.nodes.length) handle="</span><input type='checkbox' name='" + node.id + "' onclick='event.stopPropagation();NUT.AGMap.layers[this.name].visible=this.checked'"+(lyr.visible?" checked/>":"/>");
				return handle;
			}
		};
		mnuMain.refresh();
		if(AGMap.onInit)AGMap.onInit();
	}
	static htmlSymbolNodes(renderer, nodes, opt, callback){
		var i=nodes.length;
		if(i<renderer.uniqueValueInfos.length){
			var inf=renderer.uniqueValueInfos[i];
			AGMap.symbolUtils.renderPreviewHTML(inf.symbol, opt).then(function(res){
				nodes.push({icon:res, where: [renderer.field, "=", inf.value], layerTitle: inf.label, text: inf.label});
				AGMap.htmlSymbolNodes(renderer,nodes,opt,callback);
			});
		}else callback();
	}
	static zoomToSelect(maplayer) {
		var layer = AGMap.layers[maplayer];
		if (layer.highlight) {
			layer.queryFeatures({
				objectIds: layer.highlight.oid,
				returnGeometry: true
			}).then(function (res) {
				var features = res.features;
				var ext = features[0].geometry.extent;
				for (var i = 1; i < features.length; i++) {
					if (ext) ext.union(features[i].geometry.extent);
				}
				AGMap.view.goTo(ext ? ext.expand(1.5) : features[0].geometry);
			});
		}
	}
	static zoomToCoords(coords, geomtype) {
		var geom=geomtype=="point"?new AGMap.Point({x:coords[0][0],y:coords[0][1]}):(geomtype=="polygon"?new AGMap.Polygon({rings:[coords]}):new AGMap.Polyline({paths:[coords]}));
		if(geom){
			AGMap.view.graphics.removeAll();
			AGMap.view.graphics.add({
				geometry: geom,
				symbol: AGMap.SYMBOL[geomtype]
			});
			AGMap.view.goTo(geomtype=="point"?geom:geom.extent.expand(1.5));
		}
	}
	static selectByOID(maplayer, oid) {
		var layer = AGMap.layers[maplayer];
		AGMap.view.whenLayerView(layer.subtypeCode?layer.parent:layer).then(function (lyrView) {
			if (layer.highlight) layer.highlight.remove();
			layer.highlight = lyrView.highlight(oid);
			layer.highlight.oid = oid;
		});
	}
	static filterLayer(maplayer, where) {
		var layer = AGMap.layers[maplayer];
		layer.definitionExpression=where;
	}
	static selectByQuery(maplayer, query, callback) {
		var layer = AGMap.layers[maplayer];
		AGMap.view.whenLayerView(layer).then(function (lyrView) {
			lyrView.queryObjectIds(query).then(function (oid) {
				if (layer.highlight) layer.highlight.remove();
				layer.highlight = lyrView.highlight(oid);
				layer.highlight.oid = oid;
				if(callback)layer.queryFeatures({objectIds:oid,outFields:"*"}).then(callback);
			});
		});
	}
	static showEditor(maplayer) {
		var a = NUT.createWindowTitle("editor", divTitle);
		var widget = new AGMap.Editor({
			container:a.div,
			view: AGMap.view,
			layerInfos: [{layer:AGMap.layers[maplayer],enabled:true}]
		});
		widget.renderNow();
		a.innerHTML = "Editor";
	}
	static get(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open(p.method || "GET", p.url +(p.alldata ? "&resultOffset=" + (2000*p.alldata.length):"")+ (p.token&&this.token ? "&token=" + (p.token&&this.token):""), true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send();
	}
	static getAll(p,onok){
		AGMap.get(p,function(res){
			if(res.error)onok(res);
			else if(res.features.length<2000){
				p.alldata.push(res.features);
				onok(p);
			}else {
				p.alldata.push(res.features);
				AGMap.getAll(p,onok)
			};
		});
	}
	static post(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("POST", p.url + (this.token ? "&token=" + this.token : ""), true);
		xhr.setRequestHeader("Content-Type", p.contentType||"application/json;charset=UTF-8");
		xhr.send(JSON.stringify(p.data));
	}
	static submit(p, onok) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (this.readyState == XMLHttpRequest.DONE) {
				if (this.status == 0 || (this.status >= 200 && this.status < 400)) {
					if (onok) onok(JSON.parse(this.response));
				} else this.onerror(this.status);
			}
		};
		xhr.onerror = this.onerror;
		xhr.open("POST", p.url + (this.token ? "&token=" + this.token : ""), true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
		xhr.send(new URLSearchParams(p.data));
	}
	static onerror(err) {
		alert("🛑 ERROR: " + err);
	}
}