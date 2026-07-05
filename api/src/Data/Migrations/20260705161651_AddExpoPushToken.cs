using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddExpoPushToken : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "ExpoPushToken",
            table: "Users",
            type: "character varying(256)",
            maxLength: 256,
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ExpoPushToken",
            table: "Users");
    }
}
