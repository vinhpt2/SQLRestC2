var PgREST={
	OPERATOR:{
		"is":"is.",
		"!is":"not.is.",
		"like":"ilike.",
		"!like":"not.ilike.",
		"in":"in.(",
		"!in":"not.in.(",
		"=":"eq.",
		"!=":"not.eq.",
		">":"gt.",
		">=":"gte.",
		"<":"lt.",
		"<=":"lte."
	},
	decodeSql:function(p,notReturnLogic){
		var decode="";
		if(p.where){
			var i0=(p.where[0]=="and"||p.where[0]=="or"?1:0);
			var logic=i0?p.where[0]:"and";
			if(notReturnLogic!=0)logic+="=";
			var needOpen=(p.where.length>i0+1||notReturnLogic!=0);
			if(Array.isArray(p.where[i0])){//array-array
				if(needOpen)decode+=notReturnLogic?"(":logic+"(";
				for(var i=i0;i<p.where.length;i++){
					var where=p.where[i];
					var j0=(where[0]=="and"||where[0]=="or"?1:0);
					if(i>i0)decode+=",";
					if(Array.isArray(where[j0])){//array-array
						decode+=this.decodeSql({where:where},0);
					}else{//array
						var value=where[j0+2];
						var clause=where[j0]+"."+this.OPERATOR[where[j0+1]]+(typeof(value)=="string"&&value.startsWith("NUT.")?eval(value):value);
						if(where[j0+1]=="in"||where[j0+1]=="!in")clause+=")";
						decode+=clause;
					}
				}
				if(needOpen)decode+=")";
			}else{//array
				var value=p.where[i0+2];
				decode+=p.where[i0]+(i0?".":"=")+this.OPERATOR[p.where[i0+1]]+(typeof(value)=="string"&&value.startsWith("NUT.")?eval(value):value);
				if(p.where[i0+1]=="in"||p.where[i0+1]=="!in")decode+=")";
				if(notReturnLogic)decode="("+decode+")";
			}
		}

		if(p.select)decode+="&select="+p.select;
		if(_context.user.siteid&&p.url&&(p.url.includes("/sys")||p.url.includes("/nv_")))decode+="&siteid=eq."+(p.siteid!=undefined?p.siteid:_context.user.siteid);
		if(p.order)decode+="&order="+p.order;
		return decode;
	},
	select:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(JSON.parse(this.response),this.getResponseHeader("Content-Range"));
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("GET",p.url+"?"+this.decodeSql(p),true);
		if(p.range){
			xhr.setRequestHeader("Range",p.range);
			xhr.setRequestHeader("Prefer","count=exact");
		}
		xhr.send();
	},
	toCsv:function(data){
		if(data.length){
			var keys=Object.keys(data[0]);
			var csv=keys.toString();
			
			for(var i=0;i<data.length;i++){
				var line=[];
				for(var j=0;j<keys.length;j++){
					var value=data[i][keys[j]];
					(value==null)?line.push("NULL"):line.push(value);
				}
				csv+="\n"+line;
			}
			return csv;
		}
	},
	insert:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(p.data.length?this.response:JSON.parse(this.response));
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("POST",p.url,true);

		if(p.data.length){
			xhr.setRequestHeader("Content-Type","text/csv");
		}else{
			xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
			xhr.setRequestHeader("Prefer","return=representation");
		}
		xhr.send(p.data.length?this.toCsv(p.data):JSON.stringify(p.data));
	},
	insertCsv:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(this.response);
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("POST",p.url,true);
		xhr.setRequestHeader("Content-Type","text/csv");
		
		xhr.send(p.data);
	},
	update:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(this.response);
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("PATCH",p.url+"?"+this.decodeSql(p),true);
		xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
		xhr.send(JSON.stringify(p.data));
	},
	upsert:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(p.data.length?this.response:JSON.parse(this.response));
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("POST",p.url+"?on_conflict="+p.keys,true);
		xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
		xhr.setRequestHeader("Prefer","return=representation");
		xhr.send(JSON.stringify(p.data));
	},
	delete:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(this.response);
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("DELETE",p.url+"?"+this.decodeSql(p),true);
		xhr.send();
	},
	call:function(p,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(p.data.length?this.response:JSON.parse(this.response));
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open(p.method,p.url,true);

		xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
		xhr.setRequestHeader("Prefer","count=exact");
		
		xhr.send(JSON.stringify(p.data));
	},
	queryMetadata:function(url,onok){
		var xhr=new XMLHttpRequest();
		xhr.onreadystatechange=function(){
			if(this.readyState==XMLHttpRequest.DONE){
				if(this.status==0||(this.status>=200&&this.status<400))
					onok(JSON.parse(this.response));
				else
					this.onerror(this.response);
			}
		};
		xhr.onerror=this.onerror;
		xhr.open("GET",url,true);
		xhr.send();
	},
	onerror:function(err){
		alert(err);
	}
}