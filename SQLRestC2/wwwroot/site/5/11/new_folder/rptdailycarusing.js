export function run(ctx, obj, field) {
	var vn=(localStorage.language=="vi");
	var now=new Date();
	var year=now.getFullYear();
	var month=now.getMonth();
	w2popup.open({
		title:(vn?"📃 <i>Báo cáo sử dụng xe</i>":"📃 <i>Daily Car Using Report</i>"),
		modal:true,
		width: 300,
		height: 180,
		body: '<div style="margin:5px"><table width="100%"><tr><td align="right">'+(vn?"Từ ngày":"From date")+'</td><td><input class="w2field" type="date" id="datFrom" value="'+(new Date(year,month,1))+'"></input></td></tr><tr><td align="right">'+(vn?"Từ ngày":"From date")+'</td><td><input class="w2field" type="date" id="datTo" value="'+(new Date(year,month+1,0))+'"></input></td></tr></table></div>',
		actions: {
			"⛌ Cancel":function(){
				w2popup.close();
			},
			"✔️ Ok": function(){
				_openReport(ctx);
			}
		}
	});
}

async function _openReport(ctx){
	var res = await ctx.reqService.autodata.search({url:c$.urlAutoData+"/leave",where:["or",[["year(fromdate)","=",numNam.value],["month(fromdate)","=",numThang.value]],[["year(todate)","=",numNam.value],["month(todate)","=",numThang.value]]]}).toPromise();
	var lookupNghiPhep={};
	const ONE_DAY = 86400000;//24*3600*1000;
	for(var i=0;i<res.features.length;i++){
		var rec=res.features[i];
		var date=new Date(rec.fromdate).valueOf();
		var todate=new Date(rec.todate).valueOf();
		while (date <= todate) {
            lookupNghiPhep[rec.staffid+"|"+date]=rec;
            date+=ONE_DAY;
        }
	}
	var res = await ctx.reqService.autodata.search({url:c$.urlAutoData+"/staff",order:"staffname",where:["division","=",cboBoPhan.value]}).toPromise();
	if(res.features.length){
		var win=window.open(ctx.baseUrl.replace(".js",".html"));
		win.onload=function(){
			this.labBoPhan.innerHTML=cboBoPhan.options[cboBoPhan.selectedIndex].text;
			this.labThangNam.innerHTML=numThang.value+"/"+numNam.value;
			this.labNgayBaoCao.innerHTML=(new Date()).toLocaleString();
			var stt=0,phep=0;
			for(var i=0;i<res.features.length;i++){
				var rec=res.features[i];
				var row=this.tblData.insertRow();
				row.innerHTML="<td align='center'>"+(++stt)+"</td><td align='center'>"+rec.staffid+"</td><td align='center'>"+rec.staffname+"</td><td align='center'><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
				/*
				for(var j=1;j<=31;j++){
					var nghiphep=lookupNghiPhep[rec.staffid+"|"+j];
					if(nghiphep){
						row.cells[2+j].innerHTML="X";
						phep++;
					}
				}
				if(phep)row.cells[42].innerHTML=phep;
				*/
			}
		}
	} else w2alert("No data to report!","yellow");
}