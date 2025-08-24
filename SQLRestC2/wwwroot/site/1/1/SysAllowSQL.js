var SysAllowSQL = {
	run: function (p) {
		if (p.records.length) {
			var ser=p.records[0];
			if(ser.servicetype=="sqlrest"){
				var where=[["serviceid","=",ser.serviceid],["appid","=",4]];
				NUT.ds.select({url:NUT.URL+"n_appservice",where:where},function(res){
					if(res.success){
						NUT.confirm((res.result.length?'✖️ NOT allow':'✔️ Allow')+' SQL Studio access the service?', function (awnser) {
							if (awnser == "Yes"||awnser == "yes") {
								if(res.result.length)
									NUT.ds.delete({url:NUT.URL+"n_appservice",where:where},function(res2){
										if(res2.success)NUT.notify("NOT Allow done!", "lime");
										else NUT.notify("🛑 ERROR: " + res2.result, "red");
									});
								else
									NUT.ds.insert({url:NUT.URL+"n_appservice",data:{serviceid:ser.serviceid,appid:4,siteid:n$.user.siteid}},function(res2){
										if(res2.success)NUT.notify("Allow done!", "lime");
										else NUT.notify("🛑 ERROR: " + res2.result, "red");
									});
							}
						});
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			}else NUT.tagMsg("⚠️ Service type '"+ser.servicetype+"' is not support!", "yellow");
		} else NUT.tagMsg("⚠️ No Service selected!", "yellow");
	}
}