using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddRootCauseTypesAndSolutionApplied : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "RootCauseTypeId",
            table: "Incidents",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "SolutionApplied",
            table: "Incidents",
            type: "text",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "RootCauseTypes",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_RootCauseTypes", x => x.Id));

        migrationBuilder.InsertData(
            table: "RootCauseTypes",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Error de operación", "Active" },
                { 2, "Falla o desgaste de componente", "Active" },
                { 3, "Material o insumo defectuoso", "Active" },
                { 4, "Condición del área", "Active" },
                { 5, "Causa no determinada", "Active" }
            });

        migrationBuilder.CreateIndex(
            name: "IX_Incidents_RootCauseTypeId",
            table: "Incidents",
            column: "RootCauseTypeId");

        migrationBuilder.AddForeignKey(
            name: "FK_Incidents_RootCauseTypes_RootCauseTypeId",
            table: "Incidents",
            column: "RootCauseTypeId",
            principalTable: "RootCauseTypes",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Incidents_RootCauseTypes_RootCauseTypeId",
            table: "Incidents");

        migrationBuilder.DropTable(
            name: "RootCauseTypes");

        migrationBuilder.DropIndex(
            name: "IX_Incidents_RootCauseTypeId",
            table: "Incidents");

        migrationBuilder.DropColumn(
            name: "RootCauseTypeId",
            table: "Incidents");

        migrationBuilder.DropColumn(
            name: "SolutionApplied",
            table: "Incidents");
    }
}
