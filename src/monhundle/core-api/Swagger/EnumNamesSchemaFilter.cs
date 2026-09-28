using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace core_api.Swagger;

/// <summary>
/// Enums are serialized as numbers, so the schema only lists their values. This adds the matching
/// member names, in the same order, under the <c>x-enum-varnames</c> extension, which lets client
/// generators produce named enums instead of bare numbers.
/// </summary>
public class EnumNamesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum)
        {
            return;
        }

        var names = new OpenApiArray();
        foreach (var value in schema.Enum)
        {
            var number = ((OpenApiInteger)value).Value;
            names.Add(new OpenApiString(Enum.GetName(context.Type, number)));
        }

        schema.Extensions["x-enum-varnames"] = names;
    }
}
