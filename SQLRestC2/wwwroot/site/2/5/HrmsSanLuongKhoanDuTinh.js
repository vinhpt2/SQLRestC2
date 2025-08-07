var HrmsSanLuongKhoanDuTinh={
	run:function(p,target){
		HrmsSanLuongKhoanDuTinh.url=NUT.services[2].url;
		var now=new Date();
		var nam=now.getFullYear();
		var thang=now.getMonth()+1;

		NUT.ds.select({url:HrmsSanLuongKhoanDuTinh.url+"data/chitieu",where:[["manhanvien","=",n$.user.username],["nam","=",nam],["thang","=",thang]]},function(res){
			if(res.success){//da co chi tieu
				if(res.result.length==0)NUT.w2popup.open({
					title: '🎯 - <i>Sản lượng khoán</i>',
					modal:true,
					showClose:false,
					width:400,
					height:250,
					body: '<h2>Nhập sản lượng khoán (két)</h2><table border="1px" cellspacing="0px" style="margin:auto;width:100%;text-align:center"><caption style="background:pink"><b><i>'+n$.user.username+'</i> - Tháng '+(thang+'/'+nam)+'</b></caption><tr><td>Bold</td><td>Light</td><td>TrucBach</td><td>Pre sleek<br/>lon</td><td>HanoiPre<br/>chai</td></tr><tr><td><input type="number" id="num_bold" style="width:50px"></td><td><input type="number" id="num_light" style="width:50px"></td><td><input type="number" id="num_trucbach" style="width:50px"></td><td><input type="number" id="num_hanoiprel" style="width:50px"></td><td><input type="number" id="num_hanoipre" style="width:50px"></td></tr></table>',
					buttons: '<button class="w2ui-btn" onclick="HrmsSanLuongKhoanDuTinh.doKhoanSanLuong()">✔️ Ok</button>'
				});else{
					var rec=res.result[0];
					var sum=rec.bold+rec.light+rec.trucbach+rec.hanoipre+rec.hanoiprel;
					NUT.alert("<h3>Sản lượng khoán (két)</h3><table border='1px' cellspacing='0px' style='text-align:center;margin:auto'><caption style='background:pink'><b>"+n$.user.username+"<i> - Tháng "+rec.thang+"/"+rec.nam+"</i></b></caption><tr><td><b style='color:brown'>Tổng</b></td><td>Bold</td><td>Light</td><td>TrucBach</td><td>Pre sleek<br/>lon</td><td>HanoiPre<br/>chai</td></tr><tr><td><b style='color:brown'>"+sum+"</b></td><td>"+rec.bold+"</td><td>"+rec.light+"</td><td>"+rec.trucbach+"</td><td>"+rec.hanoiprel+"</td><td>"+rec.hanoipre+"</td></tr></table>");
				}
			}
		});
	},
	doKhoanSanLuong:function(){
		var now=new Date();
		var data={madoitac:n$.user.tag,manhanvien:n$.user.username,nam:now.getFullYear(),thang:now.getMonth()+1};
		var sum=0;
		if(num_bold.value>0){data.bold=num_bold.value;sum+=parseInt(data.bold)}
		if(num_light.value>0){data.light=num_light.value;sum+=parseInt(data.light)}
		if(num_trucbach.value>0){data.trucbach=num_trucbach.value;sum+=parseInt(data.trucbach)}
		if(num_hanoipre.value>0){data.hanoipre=num_hanoipre.value;sum+=parseInt(data.hanoipre)}
		if(num_hanoiprel.value>0){data.hanoiprel=num_hanoiprel.value;sum+=parseInt(data.hanoiprel)}
		if(sum==0){
			NUT.notify("Nhập số lượng Khoán sản lượng!","yellow",document.activeElement);
			return;
		}
		
		NUT.ds.insert({url:HrmsSanLuongKhoanDuTinh.url+"data/chitieu",data:data},function(res){
			NUT.notify("Khoán sản lượng inserted!","lime");
			NUT.w2popup.close()
		});
		
	}
}