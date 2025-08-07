var RptKetQuaKinhDoanh={
	run:function(p){
		RptKetQuaKinhDoanh.url = NUT.services[3].url;
		var now=(new Date()).toISOString().substring(0,10);
		NUT.w2popup.open({
			title: '📜 <i>Kết quả kinh doanh</i>',
			modal:true,
			width: 360,
			height: 180,
			body: "<table style='margin:auto'><caption><i><b>Báo cáo</b></i></caption><tr><td>Từ ngày</td><td><input id='datTuNgay' type='date' value='"+now+"'/></td><td>Đến ngày</td><td><input id='datDenNgay' type='date' value='"+now+"'/></td></tr></table>",
			actions: {
				"_Close": function () {
					NUT.w2popup.close();
				},
				"_Ok": function () {
					NUT.ds.post({url:RptKetQuaKinhDoanh.url+"procedure/kqkd_sp/'"+datTuNgay.value+"','"+datDenNgay.value+"'"},function(res){
						if(res.success&&res.result.length){
							var win=window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/RptKetQuaKinhDoanh.html");
							win.onload=function(){
								var rec=res.result[0];
								this.labNgay.innerHTML=(datTuNgay.value?datTuNgay.value:"Trước")+" ~ "+(datDenNgay.value?datDenNgay.value:(new Date()).toLocaleDateString());
								this.lab1.innerHTML=rec.DOANH_THU.toLocaleString();
								this.lab2.innerHTML=rec.GIAM_TRU_DT.toLocaleString();
								this.lab3.innerHTML=(rec.DOANH_THU-rec.GIAM_TRU_DT).toLocaleString();
								this.lab4.innerHTML=rec.GIA_VON.toLocaleString();
								var loinhuangop=rec.DOANH_THU-rec.GIAM_TRU_DT-rec.GIA_VON;
								this.lab5.innerHTML=loinhuangop.toLocaleString();
								this.lab6.innerHTML=rec.DT_TAI_CHINH.toLocaleString();
								this.lab7.innerHTML=rec.CP_TAI_CHINH.toLocaleString();
								this.lab8.innerHTML=rec.CP_QUAN_LY.toLocaleString();
								var loinhuanthuan=loinhuangop+rec.DT_TAI_CHINH-rec.CP_TAI_CHINH-rec.CP_QUAN_LY;
								this.lab9.innerHTML=loinhuanthuan.toLocaleString();
								this.lab10.innerHTML=rec.THU_KHAC.toLocaleString();
								this.lab11.innerHTML=rec.CP_KHAC.toLocaleString();
								this.lab12.innerHTML=(rec.THU_KHAC-rec.CP_KHAC).toLocaleString();
								var loinhuantruocthue=loinhuanthuan+rec.THU_KHAC-rec.CP_KHAC;
								this.lab13.innerHTML=loinhuantruocthue.toLocaleString();
								this.lab14.innerHTML=rec.CP_THUE.toLocaleString();
								this.lab15.innerHTML=(loinhuantruocthue-rec.CP_THUE).toLocaleString();
							}
						} else NUT.notify("⚠️ No data to report!","yellow");
					});

				}
			}
		})

	}
}