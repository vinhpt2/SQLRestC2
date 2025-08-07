var Com_HrmsInCamKetNhanVien={
	run:function(p){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhanvien_v",where:["manhanvien","=",_context.user.username]},function(res){
			var nv=res[0];
			NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd",where:["manhanvien","=",nv.manhanvien]},function(res){
				if(res.length){
					var hd=res[res.length-1];
					var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_CamKetNhanVien.html");
					win.onload=function(){
						var ymd=hd.ngaykyhd.split("-");
						this.ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
						
						this.hoten.innerHTML=nv.hoten||"";
						this.ngaysinh.innerHTML=NUT.dmy(nv.ngaysinh)||"";
						this.noio.innerHTML=nv.noio||"";
						this.socmt.innerHTML=nv.socmt||"";
						this.ngaycapcmt.innerHTML=NUT.dmy(nv.ngaycapcmt)||"";
						this.noicapcmt.innerHTML=nv.noicapcmt||"";				
						this.vitrilv.innerHTML=_context.domain[14].lookup[nv.vitrilv]||"";
						this.vitrilv2.innerHTML=_context.domain[14].lookup[nv.vitrilv]||"";
						var isPG=(nv.vitrilv=="BA")||"";
						this.dieu2PG.style.display=(isPG?"":"none");
						this.dieu2SM.style.display=(isPG?"none":"");
						//this.print();
					}
				} else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
			});
		});
	}
}