using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Smo;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data;
using System.Diagnostics.Eventing.Reader;
using System.Reflection;
using System.Security.Policy;
using System.Text.Json;

namespace SQLRestC2.Controllers
{
    [Authorize]
    [ApiController]
    [Route(Global.ROOT + "{database}/{schema}/query")]
    public class QueryController : ControllerBase
    {
        //execute query
        [HttpPost]
        public ResponseJson ExecuteQuery(String database, String schema,ScriptJson sql)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var cred = user.credentials[database + "." + schema];
                var response = new ResponseJson { success = user.issystem && cred != null };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, cred.accessuser, cred.accesspass));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = Global.safeSqlInjection(sql.body);
                        if (response.success)
                        {
                            db.DefaultSchema = schema;
                            using (var ds = db.ExecuteWithResults(sql.body))
                            {
                                var tb = ds.Tables[0];
                                response.total = tb.Rows.Count;
                                response.result = Global.dtable2array(tb, Global.LIMIT);
                            }
                        }
                        else response.result = "SQL INJECTION FOUND! Not safe to executes.";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "No Credential or not System User";
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
        //execute noquery
        [HttpPut]
        public ResponseJson ExecuteNoQuery(String database, String schema, ScriptJson sql)
        {
            Server server = null;
            try
            {
                var user = Global.profiles[this.User.Identity.Name];
                var cred = user.credentials[database + "." + schema];
                var response = new ResponseJson { success = user.issystem && cred != null };
                if (response.success)
                {
                    server = new Server(new ServerConnection(Global.server, cred.accessuser, cred.accesspass));
                    var db = server.Databases[database];
                    response.success = (db != null);
                    if (response.success)
                    {
                        response.success = Global.safeSqlInjection(sql.body);
                        if (response.success)
                        {
                            db.DefaultSchema = schema;
                            db.ExecuteNonQuery(sql.body);
                        }
                        else response.result = "SQL INJECTION FOUND! Not safe to executes.";
                    }
                    else response.result = "Database '" + database + "' not found!";
                }
                else response.result = "No Credential or not System User";
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
