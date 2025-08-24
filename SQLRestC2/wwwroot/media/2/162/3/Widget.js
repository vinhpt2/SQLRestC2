.pin:before{ 
	content:url("pin.png"); 
}
.cross:before{ 
	content:url("cross.png"); 
}
.link{
	color:blue;
	cursor:pointer;
	text-decoration: underline
}
.para{
	margin-bottom:5px;
}rocessor',"esri/layers/GraphicsLayer" ],
function (declare, BaseWidget,esriRequest,webMercatorUtils,Color,Graphic,Point,SimpleMarkerSymbol,Geoprocessor,GraphicsLayer) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
        that: null,
        
        postCreate: function () {
			that=this;
            this.process=new Geoprocessor(that.config.urlProcessor);
			this.symbol=new SimpleMarkerSymbol({type:"esriSMS",style:"esriSMSCircle",color:that.config.input.color,size:that.config.input.size});
			this.symbSelect=new SimpleMarkerSymbol({type:"esriSMS",style:"esriSMSCircle",color:that.config.select.color,size:that.config.select.size});
			
			this.lyrOutputs=[];
			for(i=0;i<that.config.outputs.length;i++){
				var output=that.config.outputs[i];
				this.lyrOutputs.push(new GraphicsLayer());
			}
			
			this.map.addLayers(this.lyrOutputs);
			this.lyrSelect=new GraphicsLayer();
			this.map.addLayer(this.lyrSelect);
			
			this.map.on("click",function(evt){
				if(that.tool=="POINT"){
					var lnglat=webMercatorUtils.xyToLngLat(evt.mapPoint.x,evt.mapPoint.y);
					this.graphics.clear();
					this.graphics.add(new Graphic(evt.mapPoint,that.symbol));
					txtLng.value=lnglat[0].toFixed(5);txtLat.value=lnglat[1].toFixed(5);
				}
			});
        },

        startup: function () {
			fileNCF.onchange=function(evt){
				imgUpload.style.display="";
				that.formParams.lock();
				esriRequest({
					url:that.config.urlUpload,
					content:{f:"json"},
					form:frmFile,
					handleAs:'json',
					load:function(res){
						that.itemID={itemID:res.item.itemID};
						imgUpload.style.display="none";
						that.formParams.unlock();
					},
					error:function(err){
						imgUpload.style.display="none";
						that.formParams.unlock();
						w2alert(err,"Lỗi!");
					}
				},{usePost:true});
			};
            $("#divInputPoint").w2toolbar({name:'divInputPoint',items:[
				{ type: 'check', id: 'POINT', tooltip: 'Add '+that.config.input.name, icon: 'pin' },
				{ type: 'button', id: 'CLEAR', tooltip: 'Clear '+that.config.input.name, icon: 'cross' },
				{ type: 'spacer'},
				{ type: 'html', html:"Tọa độ: <input type='number' style='width:80px' id='txtLng' onblur='that.txtLngLat_onBlur()'/><input type='number' style='width:80px' id='txtLat' onblur='that.txtLngLat_onBlur()'/>" }],
				onClick:function(evt){
					var item=evt.item;
					switch(item.id){
						case "POINT":
							if(!item.checked){
								that.map.graphics.clear();
								txtLng.value="";txtLat.value="";
							}
							that.tool=item.checked?"":"POINT";
							break;
						case "CLEAR":
							that.map.graphics.clear();
							txtLng.value="";txtLat.value="";
							for(var i=0;i<that.lyrOutputs.length;i++){
								that.lyrOutputs[i].clear();
								tblLegend.rows[i].cells[4].innerHTML="";
							}
							that.lyrSelect.clear();
							w2ui.gridOutput.clear();
							
							break;
					}
				}
			});
			this.formParams=$("#divParams").w2form({name:'divInputForm',fields: [
				{ field: "khoangchay", type: 'select', required:true, html: {label:'Khoảng chạy', span:4, attr:"tabindex=0"}, options: { items: ["2", "5", "7"], value:"2" }},
				{ field: "ngaygio", type: 'datetime', required: true, html: {label:'Ngày giờ', span:4, attr:"tabindex=0"}}],
				actions:{
					Run:function(evt){
						if(that.itemID&&that.map.graphics.graphics.length>0){
							if(this.validate(true).length)return;
							var features=[];
							for(var i=0;i<that.map.graphics.graphics.length;i++){
								var json=that.map.graphics.graphics[i].geometry.toJson();
								features.push({geometry:json});
							}

							var p={
								inputP:JSON.stringify({geometryType:"esriGeometryPoint",features:features}),
								time:Date.parse(this.record.ngaygio),
								NCF:JSON.stringify(that.itemID),
								khoangchay:this.record.khoangchay
							};
							p["env:outSR"]=that.map.spatialReference.wkid;
							this.lock("Đang thực thi...",true);
							var self=this;
							that.process.execute(p, function(res){
								if(res.length==that.config.outputs.length)for(var i=0;i<res.length;i++){
									that.lyrOutputs[i].clear();
									that.lyrOutputs[i].fields=res[i].value.fields;
									var features=res[i].value.features;
									var output=that.config.outputs[i];
									var symb=new SimpleMarkerSymbol({type:"esriSMS",style:"esriSMSCircle",color:output.color,size:output.size});;
									for(var j=0;j<features.length;j++){
										var feature=features[j];
										var g=new Graphic(new Point(feature.geometry),symb,feature.attributes);
										that.lyrOutputs[i].add(g);
									}
									tblLegend.rows[i].cells[4].innerHTML="("+features.length+")";
								}else{
									w2alert("Lỗi Outputs!","Lỗi!");
								}
								self.unlock();
								tblLegend.style.display="";
							}, function(err){
								self.unlock();
								w2alert(err,"Lỗi!");
							});
						}else{
							w2alert("Upload file NCF và Xác định điểm tràn dầu trước khi thực hiện!","Cảnh báo!");
						}
					}
				}
			});
			for(var i=0;i<this.lyrOutputs.length;i++){
				var output=that.config.outputs[i];
				var row=tblLegend.insertRow();
				row.innerHTML="<td>&nbsp;</td><td><input type='checkbox' checked onClick='that.chk_onClick("+i+",this.checked)'></td><td style='color:rgb("+output.color+")'>&nbsp;⬤&nbsp;</td><td><i>"+output.name+"</i></td><td class='link' onclick='that.lab_onClick("+i+")'></td>";
			}
        },

		txtLngLat_onBlur: function(){
			if(txtLng.value&&txtLat.value){
				var xy=webMercatorUtils.lngLatToXY(txtLng.value,txtLat.value);
				that.map.graphics.clear();
				that.map.graphics.add(new Graphic(new Point(xy[0],xy[1],that.map.spatialReference),that.symbol));
			}
		},

        chk_onClick: function (index,visibled) {
            that.lyrOutputs[index].setVisibility(visibled);
        },

        lab_onClick: function (index) {
			if(that.lyrOutputs[index]){
				var lyr=that.lyrOutputs[index];
				var columns=[];
				for(var i=0;i<lyr.fields.length;i++){
					var fld=lyr.fields[i];
					var col={ field: fld.name, text: fld.alias, size: (i?'110px':'30px') };
					if(fld.type=="esriFieldTypeDate")col.render=function(rec,index,colIndex){
						return w2utils.formatDateTime(rec[this.columns[colIndex].field]);
					};
					columns.push(col);
				}
				var records=[];
				for(var i=0;i<lyr.graphics.length;i++){
					var g=lyr.graphics[i];
					g.attributes.recid=i;
					records.push(g.attributes);
				}
				
				if(w2ui.gridOutput){
					w2ui.gridOutput.header=that.config.outputs[index].name;
					w2ui.gridOutput.columns=columns,
					w2ui.gridOutput.records=records,
					w2ui.gridOutput.refresh();
				}else{
					$("#gridOutput").w2grid({
						name: 'gridOutput',
						header: that.config.outputs[index].name,
						columns: columns,
						records:records,
						multiSelect:false,
						fixedBody:false,
						show:{header: true},
						onClick:function(evt){
							var g=this.tag.graphics[evt.recid];
							that.lyrSelect.clear();
							that.lyrSelect.add(new Graphic(g.geometry,that.symbSelect));
							that.map.centerAndZoom(g.geometry, 13);
						}
					}).tag=lyr;
				}
			}
        }
    });
});