using System.Text.Json.Nodes;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace core_api.Swagger;

/// <summary>
/// Enums are serialized as numbers, so the schema only lists their values. This adds the matching
/// member names, in the same order, under the <c>x-enum-varnames</c> extension, which lets client
/// generators produce named enums instead of bare numbers.
/// </summary>
public class EnumNamesSchemaFilter : ISchemaFilter
{
    public void Apply(IOpenApiSchema schema, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum || schema is not OpenApiSchema { Enum: not null } enumSchema)
        {
            return;
        }

        var names = new JsonArray();
        foreach (var value in enumSchema.Enum)
        {
            var number = value!.GetValue<int>();
            names.Add(Enum.GetName(context.Type, number));
        }

        enumSchema.Extensions ??= new Dictionary<string, IOpenApiExtension>();
        enumSchema.Extensions["x-enum-varnames"] = new JsonNodeExtension(names);
    }
}
