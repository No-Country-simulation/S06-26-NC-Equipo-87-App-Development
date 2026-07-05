using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class UpdateShiftNames : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DeleteData(
            table: "Shifts",
            keyColumn: "Id",
            keyValue: 3);

        migrationBuilder.UpdateData(
            table: "Shifts",
            keyColumn: "Id",
            keyValue: 1,
            column: "Name",
            value: "Matutino");

        migrationBuilder.UpdateData(
            table: "Shifts",
            keyColumn: "Id",
            keyValue: 2,
            column: "Name",
            value: "Vespertino");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.UpdateData(
            table: "Shifts",
            keyColumn: "Id",
            keyValue: 1,
            column: "Name",
            value: "Turno mañana");

        migrationBuilder.UpdateData(
            table: "Shifts",
            keyColumn: "Id",
            keyValue: 2,
            column: "Name",
            value: "Turno tarde");

        migrationBuilder.InsertData(
            table: "Shifts",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[] { 3, "Turno nocturno", "Active" });
    }
}
