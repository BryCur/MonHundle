using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace core_api.Swagger;

/// <summary>
/// Marks the properties of an object schema as required. System.Text.Json writes every property
/// (null ones included), so they are always present in the payload; whether a property may hold
/// <c>null</c> is described separately by its <c>nullable</c> flag. Properties that can be left out
/// of the payload stay optional.
/// </summary>
public class RequireAllPropertiesSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (schema.Properties is null || schema.Properties.Count == 0)
        {
            return;
        }
        
        // get all "forgettable" props in schema
        var omittablePropertyNames = context.Type
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property =>
                property.GetCustomAttribute<JsonIgnoreAttribute>() is { } ignore
                && ignore.Condition != JsonIgnoreCondition.Never)
            .Select(property =>
                property.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name
                ?? JsonNamingPolicy.CamelCase.ConvertName(property.Name))
            .ToHashSet();
        
        foreach (var propertyName in schema.Properties.Keys)
        {
            if (!omittablePropertyNames.Contains(propertyName))
            {
                schema.Required.Add(propertyName);
            }
        }
    }
}
