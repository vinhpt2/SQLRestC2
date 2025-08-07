using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SQLRestC2.Controllers
{
    [ApiController]
    [Route(Global.ROOT + "chamcong")]
    public class ChamCongController : ControllerBase
    {
        //generate token
        [HttpPost]
        public ResponseJson Generate(String[] data)
        {
            Server server = null;
            try
            {
                server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                var db = server.Databases[Global.database];
                var response = new ResponseJson { success = (db != null) };
                if (response.success)
                {
                    response.success = data.Length == 3 && (data[0].Length>0 && data[1].Length > 0 && data[2].Length > 0) && !(data[0].Contains("'")|| data[1].Contains("'")|| data[2].Contains("'"));
                    if (response.success)
                    {
                        var username = data[0]; var sitecode = data[1]; var password = data[2];
                        var sql = "select * from nv_user_site where username='" + username + "' and sitecode='"+sitecode+"' and password='" + password + "'";

                        using (var ds = db.ExecuteWithResults(sql))
                        {
                            var users=Global.dtable2array(ds.Tables[0]);
                            response.success = (users.Length == 1);
                            if (response.success)
                            {
                                var info = users[0];
                                response.success = username.Equals(info["username"]) && password.Equals(info["password"]) && sitecode.Equals(info["sitecode"]);
                                if (response.success)
                                {
                                    var user = new User();
                                    user.userid = (int)info["userid"];
                                    user.siteid = (int)info["siteid"];
                                    user.issystem = true.Equals(info["issystem"]);
                                    user.isviewer = true.Equals(info["isviewer"]);
                                    var sql2 = "select roleid id,rolename text from n_role where roleid in(select roleid from n_roleuser where siteid=" + user.siteid + " and userid=" + user.userid + ") order by seqno;select orgid id,orgcode code,orgname text,parentid from n_org where siteid=" + user.siteid + " and orgid in(select orgid from n_orguser where userid=" + user.userid + ") order by seqno";
                                    using (var ds2 = db.ExecuteWithResults(sql2))
                                    {
                                        var tbl2 = ds2.Tables[0];
                                        response.success = (tbl2.Rows.Count > 0);
                                        if (!response.success)
                                        {
                                            response.result = "User '" + username + "' has no role!";
                                            return response;
                                        }
                                        user.roles = Global.dtable2lookup(tbl2, "id");
                                        user.orgs = Global.dtable2lookup(ds2.Tables[1], "id");
                                    }
                                    Global.profiles[user.userid.ToString()] = user;
                                    //gen token
                                    var jwtToken = new JwtSecurityToken(
                                        claims: new List<Claim>() { new Claim(ClaimTypes.Name, user.userid.ToString()) },
                                        notBefore: DateTime.UtcNow,
                                        expires: DateTime.UtcNow.AddDays(1),
                                        signingCredentials: new SigningCredentials(
                                            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Global.jwtkey)), SecurityAlgorithms.HmacSha256Signature)
                                    );
                                    info.Add("roles", user.roles);
                                    info.Add("orgs", user.orgs);
                                    info.Add("token", new JwtSecurityTokenHandler().WriteToken(jwtToken));
                                    response.result = info;
                                }
                                else response.result = "User '" + username + "' is Illegal!";
                            }
                            else response.result = "User '" + username + "' is not Authorize!";
                        }
                    }
                    else response.result = "Invalid data for check login/Character ' is not allow!";
                }
                else response.result = "Database '" + Global.database + "' not found!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //set role & org
        [Authorize]
        [HttpPut]
        public ResponseJson SetRoleOrg(int[] data)
        {
            Server server = null;
            try {
                var identity=this.User.Identity.Name;
                var response = new ResponseJson { success = Global.profiles.ContainsKey(identity)  };
                if (response.success)
                {
                    response.success = (data.Length == 2);
                    if (response.success)
                    {
                        int roleid = data[0];int orgid = data[1];
                        var user = Global.profiles[identity];
                    response.success = (user.roles.ContainsKey(roleid));
                        if (response.success)
                        {
                            user.roleid = roleid;
                            response.success = (orgid==0||user.orgs.ContainsKey(orgid));
                            if (response.success)
                            {
                                //user.orgwhere = user.columnorg+"="+orgid;
                                server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                                var db = server.Databases[Global.database];
                                response.success = (db != null);
                                if (response.success)
                                {
                                    //get access
                                    var sql = "select * from nv_access_table where roleid=" + roleid+ ";select * from nv_role_app where roleid="+roleid + " order by seqno";
                                    using (var ds = db.ExecuteWithResults(sql))
                                    {
                                        //access
                                        var tbl = ds.Tables[0];
                                        user.access = new Dictionary<String, Access>(tbl.Rows.Count);
                                        for (int i = 0; i < tbl.Rows.Count; i++)
                                        {
                                            var row = tbl.Rows[i];
                                            user.access[(String)row["tablename"]] = user.access[row["tableid"].ToString()] = new Access { noselect = (bool)row["noselect"], noinsert = (bool)row["noinsert"], noupdate = (bool)row["noupdate"], nodelete = (bool)row["nodelete"], noexport = (bool)row["noexport"], noattach = (bool)row["noattach"], isarchive = (bool)row["isarchive"], islock = (bool)row["islock"] };
                                        }
                                        //app
                                        user.apps = Global.dtable2lookup(ds.Tables[1], "appid");
                                        var result = new Dictionary<String, Object>(2);
                                        result.Add("access", user.access);
                                        result.Add("apps", user.apps);
                                        response.result=result;
                                    }
                                }
                                else response.result = "Database '" + Global.database + "' not found!";
                            }
                            else response.result = "Org " + orgid + " not allow to set!";
                        }
                        else response.result = "Role " +roleid+ " not allow to set!";
                    }
                    else response.result = "No data for [roleid,orgid]!";
                }
                else response.result = "User '" + identity + "' not login yet!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //get application
        [Authorize]
        [HttpGet("app/{id}")]
        public ResponseJson GetApp(int id)
        {
            Server server = null;
            try
            {
                var identity = this.User.Identity.Name;
                var response = new ResponseJson { success = Global.profiles.ContainsKey(identity) };
                if (response.success)
                {
                    var user = Global.profiles[identity];
                    response.success = user.apps.ContainsKey(id);
                    if (response.success)
                    {
                        server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                        var db = server.Databases[Global.database];
                        response.success = (db != null);
                        if (response.success)
                        {
                            var where = " where appid=" + id;
                            if (id != 1) where += " and siteid=" + user.siteid;
                            var sql = "select domainid,domainjson from n_domain" + where + ";select * from nv_appservice_service" + where + ";select * from nv_appservice_table" + where + ";select * from nv_wfstep_workflow" + where + ";select * from nv_rolemenu_menu" + where + " and menutype<>'tool' and roleid=" + user.roleid + " order by seqno";
                            using (var ds = db.ExecuteWithResults(sql))
                            {
                                response.success = (ds.Tables[2].Rows.Count > 0);
                                if (!response.success)
                                {
                                    response.result = "Application has no table data!";
                                    return response;
                                }
                                var domains = Global.dtable2array(ds.Tables[0]);
                                var services = Global.dtable2lookup(ds.Tables[1], "serviceid");
                                var tables = Global.dtable2lookup(ds.Tables[2], "tableid");
                                var tableIds = new List<int>(tables.Count);
                                var relTableIds = new List<int>(tables.Count);
                                foreach(var table in tables.Values) {
                                    var url = services[(int)table["serviceid"]]["url"] + "data/";
                                    table.Add("urlview", url + (table["viewname"]==null? table["tablename"] : table["viewname"]));
                                    table.Add("urledit", url + table["tablename"]);
                                    var tid = (int)table["tableid"];
                                    tableIds.Add(tid);
                                    if ("relate".Equals(table["tabletype"])) relTableIds.Add(tid);
                                }
                                var wfsteps = Global.dtable2array(ds.Tables[3]);
                                var wfRoleIds = new int[wfsteps.Length];
                                for(var j=0;j<wfsteps.Length;j++)
                                {
                                    wfRoleIds[j] = (int)wfsteps[j]["roleid"];
                                }
                                var menus = Global.dtable2array(ds.Tables[4]);
                                var pMenuIds = new List<int>(menus.Length);
                                int oldPid = 0;
                                for (var i=0;i<menus.Length;i++)
                                {
                                    var pid = menus[i]["parentid"];
                                    if (pid != null)
                                    {
                                        if (oldPid != (int)pid)
                                        {
                                            pMenuIds.Add((int)pid);
                                            oldPid = (int)pid;
                                        }
                                    }
                                }
                                var sql2 = "select tableid,columntype,columnname,domainid from n_column where columntype is not null and tableid in (" + String.Join(',', tableIds) + ") order by seqno";
                                bool hasParentMenu = (pMenuIds.Count > 0);
                                if (hasParentMenu) sql2 += ";select menuid,menuname,icon,menutype,translate,isopen,parentid,whereclause,1 haschild from n_menu where menuid in(" + String.Join(',', pMenuIds) + ") order by seqno";
                                if (relTableIds.Count > 0) sql2 += ";select tableid,linktableid,columnname,linkcolumn from n_column where linktableid is not null and tableid in (" + String.Join(',', relTableIds) + ")";
                                if (wfRoleIds.Length > 0) sql2 += ";select * from nv_roleuser_user where active=1 and roleid in(" + String.Join(",", wfRoleIds) + ")";
                                var result=new Dictionary<String, Object>(5);
                                using (var ds2 = db.ExecuteWithResults(sql2))
                                {
                                    var tbl2 = ds2.Tables[0];
                                    for (int r = 0; r < tbl2.Rows.Count; r++)
                                    {
                                        var row = tbl2.Rows[r];
                                        var t = tables[(int)row["tableid"]];
                                        var key = "column" + row["columntype"];
                                        var val = row["columnname"];
                                        if (t.ContainsKey(key)) t[key] += ","+val;
                                        else t.Add(key, val);
                                        if ("lock".Equals(val)) t.Add("lockdomainid", row["domainid"]);
                                    }
                                    
                                    result.Add("menus", hasParentMenu ? Global.dtable2array(ds2.Tables[1]).Concat(menus):menus);
                                    
                                    if (relTableIds.Count > 0)//has relate
                                    {
                                        tbl2=ds2.Tables[hasParentMenu?2:1];
                                        var lookup = new Dictionary<int, LinkColumn[]>(tbl2.Rows.Count);
                                        for (int r = 0; r < tbl2.Rows.Count; r++)
                                        {
                                            var row = tbl2.Rows[r];
                                            int tableid = (int)row["tableid"];
                                            var col=new LinkColumn { tableid = tableid, linktableid = (int)row["linktableid"], columnname = (String)row["columnname"], linkcolumn = row["linkcolumn"] is DBNull ? null : (String)row["linkcolumn"] };
                                            if (!lookup.ContainsKey(tableid)) lookup[tableid] = new LinkColumn[]{ col, null };
                                            else lookup[tableid][1] = col;
                                        }
                                        var relates = new Dictionary<String, LinkColumn[]>(lookup.Count);
                                        foreach (var rel in lookup.Values) relates.Add(rel[0].linktableid + "_" + rel[1].linktableid, rel);
                                        result.Add("relates", relates);
                                    }
                                    if (wfRoleIds.Length > 0) result.Add("wfusers", Global.dtable2array(ds2.Tables[ds2.Tables.Count - 1]));
                                }
                               
                                result.Add("domains", domains);
                                result.Add("services", services);
                                result.Add("tables", tables);
                                result.Add("wfsteps", wfsteps);
                                
                                response.result = result;
                            }
                        }
                        else response.result = "Database '" + Global.database + "' not found!";
                    }
                    else response.result = "User do not have assess right!";
                }
                else response.result = "User '" + identity + "' not login yet!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
        //get window's cache
        [Authorize]
        [HttpGet("cache/{winid}")]
        public ResponseJson GetWinCache(int winid)
        {
            Server server = null;
            try
            {
                var identity = this.User.Identity.Name;
                var response = new ResponseJson { success = Global.profiles.ContainsKey(identity) };
                if (response.success)
                {
                    var user = Global.profiles[identity];

                    server = new Server(new ServerConnection(Global.server, Global.username, Global.password));
                    var db = server.Databases[Global.database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        using (var ds = db.ExecuteWithResults("select appid,configjson,layoutjson from n_cache where windowid="+winid))
                        {
                            var row = ds.Tables[0].Rows[0];
                            response.success=(row != null);
                            if (response.success)
                            {
                                response.success = user.apps.ContainsKey((int)row["appid"]);
                                if (response.success) {
                                    var result = new Dictionary<String, Object>(1);
                                    result.Add("configjson", row["configjson"]);
                                    result.Add("layoutjson", row["layoutjson"] is DBNull ? null : row["layoutjson"]);
                                    response.result = result;
                                } else response.result = "User do not have assess right!";
                            }
                            else response.result = "Window '" + winid + "' have no cache!";
                        }
                    }
                    else response.result = "Database '" + Global.database + "' not found!";
                }
                else response.result = "User '" + identity + "' not login yet!";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseJson { success = false, result = ex.InnerException == null ? ex.Message : (ex.InnerException.InnerException == null ? ex.InnerException.Message : ex.InnerException.InnerException.Message) };
            }
            finally
            {
                if (server != null) server.ConnectionContext.Disconnect();
            }
        }
    }
}
