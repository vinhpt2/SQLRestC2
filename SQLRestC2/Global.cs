using Microsoft.SqlServer.Management.Smo;
using System.Data;

namespace SQLRestC2
{
    public class WinCache
    {
        public String configjson { get; set; }
        public String layoutjson { get; set; }
    }
    public class LinkColumn
    {
        public int tableid { get; set; }
        public int linktableid { get; set; }
        public String columnname { get; set; }
        public String linkcolumn { get; set; }
    }
    public class Access
    {
        public bool noselect { get; set; }
        public bool noinsert { get; set; }
        public bool noupdate { get; set; }
        public bool nodelete { get; set; }
        public bool noexport { get; set; }
        public bool noattach { get; set; }
        public bool islock { get; set; }
        public bool isarchive { get; set; }
    }
    public class User
    {
        public int userid;
        public int roleid;
        public int siteid;
        public bool issystem;
        public bool isviewer;
        public Dictionary<int, Dictionary<String, Object>> roles;
        public Dictionary<int, Dictionary<String, Object>> orgs;
        public Dictionary<int, Dictionary<String, Object>> apps;
        public Dictionary<String, Access> access;
    }
    public static class Global
    {
        public static String server;
        public static String database;
        public static String username;
        public static String password;
        public static String jwtkey;
        public static Dictionary<String, User> profiles = new Dictionary<String, User>();
        public const String ROOT = "rest/";
        public const String MS_PATH = "MS_PATH";
        public const String MS_ALIAS = "MS_Description";
        public const int LIMIT = 200;

        public static Dictionary<String, Object>[] dtable2array(DataTable tbl, int limit = 0)
        {
            var count = (limit == 0 ? tbl.Rows.Count : Math.Min(tbl.Rows.Count, limit));
            var rs = new Dictionary<String, Object>[count];
            for (int r = 0; r < count; r++)
            {
                var row = tbl.Rows[r];

                var rec = new Dictionary<String, Object>(row.ItemArray.Length);
                for (int c = 0; c < row.ItemArray.Length; c++)
                {
                    rec.Add(tbl.Columns[c].ColumnName, row[c] is DBNull ? null : row[c]);
                }
                rs[r] = rec;
            }
            return rs;
        }
        public static Dictionary<int, Dictionary<String, Object>> dtable2lookup(DataTable tbl, String key)
        {
            var rs = new Dictionary<int, Dictionary<String, Object>>(tbl.Rows.Count);
            for (int r = 0; r < tbl.Rows.Count; r++)
            {
                var row = tbl.Rows[r];
                var rec = new Dictionary<String, Object>(row.ItemArray.Length);
                for (int c = 0; c < row.ItemArray.Length; c++)
                {
                    rec.Add(tbl.Columns[c].ColumnName, row[c] is DBNull ? null : row[c]);
                }
                rs.Add((int)row[key], rec);
            }
            return rs;
        }

        public static DatabaseJson[] getDatabaseInfo(Server sv, bool detail = false, bool system = false)
        {
            var jsonArr = new DatabaseJson[sv.Databases.Count];
            for (int i = 0; i < jsonArr.Length; i++)
            {
                var obj = sv.Databases[i];
                if (obj.IsSystemObject == system)
                {
                    jsonArr[i] = new DatabaseJson
                    {
                        id = obj.ID,
                        name = obj.Name,
                        dataUsage = obj.DataSpaceUsage,
                        indexUsage = obj.IndexSpaceUsage,
                        schemas = detail ? getSchemaInfo(obj, false, system) : null
                    };
                }
            }
            return jsonArr;
        }

        public static SchemaJson[] getSchemaInfo(Database db, bool detail = false, bool system = false)
        {
            var jsonArr = new SchemaJson[db.Schemas.Count];
            for (int i = 0; i < jsonArr.Length; i++)
            {
                var obj = db.Schemas[i];
                if (obj.IsSystemObject == system)
                {
                    jsonArr[i] = new SchemaJson
                    {
                        id = obj.ID,
                        name = obj.Name,
                        tables = detail ? getTableInfo(db, obj.Name) : null,
                        views = detail ? getViewInfo(db, obj.Name) : null,
                        procedures = detail ? getProcedureInfo(db, obj.Name) : null
                    };
                }
            }
            return jsonArr;
        }
        public static TableJson[] getTableInfo(Database db, String schema, bool detail = false)
        {
            var sql = "select tb.object_id,tb.name from sys.tables tb left join sys.schemas sm on tb.schema_id=sm.schema_id where sm.name='" + schema + "'";
            using (var ds = db.ExecuteWithResults(sql))
            {
                var tbl = ds.Tables[0];
                var rs = new TableJson[tbl.Rows.Count];
                for (int i = 0; i < rs.Length; i++)
                {
                    var row = tbl.Rows[i];
                    rs[i] = new TableJson
                    {
                        id = (int)row["object_id"],
                        name = (String)row["name"]
                    };
                    if (detail) rs[i].columns = Global.getColumnInfo(db.Tables[rs[i].name, schema].Columns);
                }
                return rs;
            }
        }
        public static ViewJson[] getViewInfo(Database db, String schema, bool detail = false)
        {
            var sql = "select tb.object_id,tb.name from sys.views tb left join sys.schemas sm on tb.schema_id=sm.schema_id where sm.name='" + schema + "'";
            using (var ds = db.ExecuteWithResults(sql))
            {
                var tbl = ds.Tables[0];
                var rs = new ViewJson[tbl.Rows.Count];
                for (int i = 0; i < rs.Length; i++)
                {
                    var row = tbl.Rows[i];
                    rs[i] = new ViewJson
                    {
                        id = (int)row["object_id"],
                        name = (String)row["name"]
                    };
                    if (detail) rs[i].columns = Global.getColumnInfo(db.Views[rs[i].name, schema].Columns);
                }
                return rs;
            }
        }
        public static ProcedureJson[] getProcedureInfo(Database db, String schema, bool detail = false)
        {
            var sql = "select sp.object_id,sp.name from sys.procedures sp left join sys.schemas sm on sp.schema_id=sm.schema_id where sm.name='" + schema + "'";
            using (var ds = db.ExecuteWithResults(sql))
            {
                var tbl = ds.Tables[0];
                var rs = new ProcedureJson[tbl.Rows.Count];
                for (int i = 0; i < rs.Length; i++)
                {
                    var row = tbl.Rows[i];
                    rs[i] = new ProcedureJson
                    {
                        id = (int)row["object_id"],
                        name = (String)row["name"]
                    };
                }
                return rs;
            }
        }

        public static ParameterJson[] getParameterInfo(StoredProcedureParameterCollection paras)
        {
            var rs = new ParameterJson[paras.Count];
            for (int i = 0; i < rs.Length; i++)
            {
                var obj = paras[i];
                rs[i] = new ParameterJson
                {
                    id = obj.ID,
                    name = obj.Name,
                    dataType = obj.DataType.Name,
                    length = (obj.DataType.IsNumericType ? obj.DataType.NumericScale : obj.DataType.MaximumLength),
                    precision = obj.DataType.NumericPrecision,
                    defaultValue = obj.DefaultValue
                };
            }
            return rs;
        }

        public static ColumnJson[] getColumnInfo(ColumnCollection cols)
        {
            var rs = new ColumnJson[cols.Count];
            for (int i = 0; i < rs.Length; i++)
            {
                var obj = cols[i];
                rs[i] = new ColumnJson
                {
                    id = obj.ID,
                    name = obj.Name,
                    dataType = obj.DataType.Name,
                    length = (obj.DataType.IsNumericType ? obj.DataType.NumericScale : obj.DataType.MaximumLength),
                    precision = obj.DataType.NumericPrecision,
                    nullable = obj.Nullable,
                    inPrimaryKey = obj.InPrimaryKey,
                    identity = obj.Identity,
                    defaultValue = (obj.DefaultConstraint == null ? null : obj.DefaultConstraint.Text),
                    alias = obj.ExtendedProperties.Contains(Global.MS_ALIAS) ? (String)obj.ExtendedProperties[Global.MS_ALIAS].Value : null
                };
            }
            return rs;
        }

        public static bool safeSqlInjection(String sql)
        {
            return true;// !sql.Contains(";");
        }
        //obj can be Table(create new column) or Column(change exists column)
        public static Column makeColumn(ColumnJson col, Object obj)
        {
            var dataType = Global.lookupDataType(col.dataType, col.length, col.precision);
            Column column = null;
            if (obj is Table)
            {//add new
                column = new Column((Table)obj, col.name, dataType);
                if (((Table)obj).State == SqlSmoState.Existing) column.Create();
            }
            else
            {//modify
                column = (Column)obj;
                if (!String.IsNullOrEmpty(col.name)) column.Rename(col.name);
                if (dataType != null) column.DataType = dataType;
            }

            if (col.nullable != null) column.Nullable = (bool)col.nullable;
            if (col.identity != null)
            {
                column.Identity = (bool)col.identity;
                if (column.Identity)
                {
                    column.IdentitySeed = 1;
                    column.IdentityIncrement = 1;
                }
            }
            if (col.defaultValue != null)
            {
                if (column.DefaultConstraint != null) column.DefaultConstraint.Drop();
                if (col.defaultValue.Length > 0)
                {
                    var dc = column.AddDefaultConstraint();
                    dc.Text = col.defaultValue;
                    dc.Create();
                }
            }

            if (col.inPrimaryKey != null)
            {
                var tb = (Table)column.Parent;
                if (col.inPrimaryKey == true)
                {
                    // create primary key
                    var index = new Microsoft.SqlServer.Management.Smo.Index(tb, "PK_" + tb.Name);
                    index.IndexKeyType = IndexKeyType.DriPrimaryKey;
                    index.IndexedColumns.Add(new IndexedColumn(index, col.name));
                    tb.Indexes.Add(index);
                }
                else tb.Indexes.Remove("PK_" + tb.Name);
            }
            if (col.alias != null && column.State == SqlSmoState.Existing)
            {
                var prop = column.ExtendedProperties.Contains(Global.MS_ALIAS) ? column.ExtendedProperties[Global.MS_ALIAS] : new ExtendedProperty(column, Global.MS_ALIAS);
                prop.Value = col.alias;
                prop.CreateOrAlter();
            }
            return column;
        }
        //lookup data type by name
        public static DataType lookupDataType(String type, int length, int precision)
        {
            DataType dataType = null;
            switch (type)
            {
                case "bigint":
                    dataType = DataType.BigInt;
                    break;
                case "binary":
                    dataType = DataType.Binary(length);
                    break;
                case "bit":
                    dataType = DataType.Bit;
                    break;
                case "char":
                    dataType = DataType.Char(length);
                    break;
                case "date":
                    dataType = DataType.Date;
                    break;
                case "datetime":
                    dataType = DataType.DateTime;
                    break;
                case "datetime2":
                    dataType = DataType.DateTime2(length);
                    break;
                case "datatimeoffset":
                    dataType = DataType.DateTimeOffset(length);
                    break;
                case "decimal":
                    dataType = DataType.Decimal(length, precision);
                    break;
                case "float":
                    dataType = DataType.Float;
                    break;
                case "geography":
                    dataType = DataType.Geography;
                    break;
                case "geometry":
                    dataType = DataType.Geometry;
                    break;
                case "hierarchyid":
                    dataType = DataType.HierarchyId;
                    break;
                case "image":
                    dataType = DataType.Image;
                    break;
                case "int":
                    dataType = DataType.Int;
                    break;
                case "money":
                    dataType = DataType.Money;
                    break;
                case "nchar":
                    dataType = DataType.NChar(length);
                    break;
                case "ntext":
                    dataType = DataType.NText;
                    break;
                case "numeric":
                    dataType = DataType.Numeric(length, precision);
                    break;
                case "nvarchar":
                    dataType = DataType.NVarChar(length);
                    break;
                case "nvarcharmax":
                    dataType = DataType.NVarCharMax;
                    break;
                case "real":
                    dataType = DataType.Real;
                    break;
                case "smalldatetime":
                    dataType = DataType.SmallDateTime;
                    break;
                case "smallint":
                    dataType = DataType.SmallInt;
                    break;
                case "smallmoney":
                    dataType = DataType.SmallMoney;
                    break;
                case "sysname":
                    dataType = DataType.SysName;
                    break;
                case "text":
                    dataType = DataType.Text;
                    break;
                case "time":
                    dataType = DataType.Time(length);
                    break;
                case "timestamp":
                    dataType = DataType.Timestamp;
                    break;
                case "tinyint":
                    dataType = DataType.TinyInt;
                    break;
                case "uniqueidentifier":
                    dataType = DataType.UniqueIdentifier;
                    break;
                case "varbinary":
                    dataType = DataType.VarBinary(length);
                    break;
                case "varbinarymax":
                    dataType = DataType.VarBinaryMax;
                    break;
                case "varchar":
                    dataType = DataType.VarChar(length);
                    break;
                case "varcharmax":
                    dataType = DataType.VarCharMax;
                    break;
                case "variant":
                    dataType = DataType.Variant;
                    break;
            }
            return dataType;
        }
    }

    public class ScriptJson
    {
        public String body { get; set; }
        public String? parameter { get; set; }
    }

    public class ResponseJson
    {
        public bool success { get; set; }
        public Object result { get; set; }
        public long total { get; set; }
    }

    public class QueryJson
    {
        public String select { get; set; }
        public String? where { get; set; }
        public String? groupby { get; set; }
        public String? having { get; set; }
        public String? orderby { get; set; }
        public int? offset { get; set; }
        public int? limit { get; set; }
    }

    public class DatabaseJson
    {
        public int id { get; set; }
        public String name { get; set; }
        public DateTime created { get; set; }
        public double dataUsage { get; set; }
        public double indexUsage { get; set; }
        public SchemaJson[] schemas { get; set; }
    }

    public class SchemaJson
    {
        public int id { get; set; }
        public String name { get; set; }
        public TableJson[] tables { get; set; }
        public ViewJson[] views { get; set; }
        public ProcedureJson[] procedures { get; set; }
    }

    public class ProcedureJson
    {
        public int id { get; set; }
        public String name { get; set; }
        public DateTime created { get; set; }
        public String alias { get; set; }
        public String textHeader { get; set; }
        public String textBody { get; set; }
        public String path { get; set; }
        public ParameterJson[] parameters { get; set; }
    }

    public class TableJson
    {
        public int id { get; set; }
        public String name { get; set; }
        public DateTime created { get; set; }
        public String alias { get; set; }
        public double dataUsage { get; set; }
        public double indexUsage { get; set; }
        public String path { get; set; }
        public ColumnJson[] columns { get; set; }
    }

    public class ViewJson
    {
        public int id { get; set; }
        public String name { get; set; }
        public DateTime created { get; set; }
        public String alias { get; set; }
        public String textHeader { get; set; }
        public String textBody { get; set; }
        public String path { get; set; }
        public ColumnJson[] columns { get; set; }
    }

    public class ColumnJson
    {
        public int id { get; set; }
        public String? name { get; set; }
        public String? alias { get; set; }
        public String? dataType { get; set; }
        public int length { get; set; }
        public int precision { get; set; }
        public Boolean? nullable { get; set; }
        public Boolean? inPrimaryKey { get; set; }
        public Boolean? identity { get; set; }
        public String? defaultValue { get; set; }
    }

    public class ParameterJson
    {
        public int id { get; set; }
        public String? name { get; set; }
        public String? dataType { get; set; }
        public int length { get; set; }
        public int precision { get; set; }
        public String? defaultValue { get; set; }
    }
}
