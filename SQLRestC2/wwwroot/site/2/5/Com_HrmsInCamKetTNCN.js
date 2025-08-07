var Com_HrmsInCamKetTNCN={
	run:function(p){
		NUT_DS.select({url:_context.service["hrms"].urledit+"nhanvien_v",where:["manhanvien","=",_context.user.username]},function(res){
			var nv=res[0];
			NUT_DS.select({url:_context.service["hrms"].urledit+"hopdonglaodong",order:"ngaykyhd",where:["manhanvien","=",nv.manhanvien]},function(res){
				if(res.length){
					var hd=res[res.length-1];
					var win=window.open("client/"+_context.user.clientid+"/"+_context.curApp.applicationid+"/In_CamKetTNCN.html");
					win.onload=function(){
						var ymd=hd.ngaykyhd.split("-");
						this.ngaythangnam.innerHTML="Hà Nội, ngày "+(ymd[2]||".....")+" tháng "+(ymd[1]||".....")+" năm "+(ymd[0]||"........");
								
						this.hoten.innerHTML=nv.hoten||"";
						this.noio.innerHTML=nv.noio||"";
						this.namhd.innerHTML=ymd[2]||"........";
						if(nv.masothue){
							this.o1.innerHTML=nv.masothue[0]||"";
							this.o2.innerHTML=nv.masothue[1]||"";
							this.o3.innerHTML=nv.masothue[2]||"";
							this.o4.innerHTML=nv.masothue[3]||"";
							this.o5.innerHTML=nv.masothue[4]||"";
							this.o6.innerHTML=nv.masothue[5]||"";
							this.o7.innerHTML=nv.masothue[6]||"";
							this.o8.innerHTML=nv.masothue[7]||"";
							this.o9.innerHTML=nv.masothue[8]||"";
							this.o10.innerHTML=nv.masothue[9]||"";
							
							this.o11.innerHTML=nv.masothue[10]||"";
							this.o12.innerHTML=nv.masothue[11]||"";
							this.o13.innerHTML=nv.masothue[12]||"";
							this.o14.innerHTML=nv.masothue[13]||"";
						}
						//this.print();
					}
				}else NUT.tagMsg("Không có dữ liệu hợp đồng!","yellow");
			});
		});
	}
}