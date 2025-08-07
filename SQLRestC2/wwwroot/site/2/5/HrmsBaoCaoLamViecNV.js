var HrmsBaoCaoLamViecNV={
	run:function(p){
		var now=new Date();
		var nam=now.getFullYear();
		var thang=now.getMonth()+1;
		var ngay=now.getDate();
		HrmsBaoCaoLamViecNV.url = NUT.services[2].url;
		NUT.ds.select({url:HrmsBaoCaoLamViecNV.url+"data/chamcong_v",select:"sum(cong)cong,sum(bold)bold,sum(boldl)boldl,sum(light)light,sum(lightl)lightl,sum(trucbachl)trucbachl,sum(hanoipre)hanoipre,sum(hanoiprel)hanoiprel",where:[["madoitac","=","HABECO"],["nam","=",nam],["thang","=",thang],["manhanvien","=",n$.user.username]]},function(res){
			if(res.success&&res.result.length){
				var rec=res.result[0];
				NUT.ds.select({url:HrmsBaoCaoLamViecNV.url+"data/chitieu",where:[["madoitac","=","HABECO"],["nam","=",nam],["thang","=",thang],["manhanvien","=",n$.user.username]]},function(res2){
					var ct=res2.result[0]||{bold:"-/-",light:"-/-",trucbach:"-/-",hanoipre:"-/-",hanoiprel:"-/-"};
					NUT.w2popup.open({
						title: '🚪 <i>Chấm công</i> - <b>#<i>'+nam+'-'+thang+'-'+ngay+'</i></b>',
						modal:true,
						width: 350,
						height: 400,
						body: '<table border="1px" cellspacing="0px" style="margin:auto;width:100%"><caption style="color:brown"><h2>Ngày công & Sản lượng</h2><b>Tháng '+thang+' Năm '+nam+'</b></caption><tr style="background:gold"><th>Ngày công</th><th colspan="2">Sản lượng</th><th>Khoán (két)</th></tr><tr><th rowspan="8"><h1 style="color:brown">'+rec.cong+'</h1></th><td>Bold</td><th>'+rec.bold+'</th><th rowspan="2">'+ct.bold+'</th></tr><tr><td>Bold lon</td><th>'+rec.boldl+'</th></tr><tr><td>Light</td><th>'+rec.light+'</th><th rowspan="2">'+ct.light+'</th></tr><tr><td>Light lon</td><th>'+rec.lightl+'</th></tr><tr><td>TrucBach</td><th>'+rec.trucbachl+'</th><th rowspan="2">'+ct.trucbach+'</th></tr><tr><td></td><th></th></tr><tr><td>Pre Sleek</td><th>'+rec.hanoiprel+'</th><th>'+ct.hanoiprel+'</th></tr><tr><td>HanoiPre</td><th>'+rec.hanoipre+'</th><th>'+ct.hanoipre+'</th></tr></table>',
						buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Close</button>'
					});
				});
			}else NUT.notify("Không có dữ liệu Chấm công của"+n$.user.username,"yellow");
		});
			
	}
}