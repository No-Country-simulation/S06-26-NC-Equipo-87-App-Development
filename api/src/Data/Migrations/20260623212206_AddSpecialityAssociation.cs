using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddSpecialityAssociation : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "SpecialityId",
            table: "Users",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "SpecialityId",
            table: "IncidentTypes",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateTable(
            name: "Specialities",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Specialities", x => x.Id));

        migrationBuilder.UpdateData(
            table: "IncidentTypes",
            keyColumn: "Id",
            keyValue: 1,
            column: "SpecialityId",
            value: 1);

        migrationBuilder.UpdateData(
            table: "IncidentTypes",
            keyColumn: "Id",
            keyValue: 2,
            column: "SpecialityId",
            value: 3);

        migrationBuilder.UpdateData(
            table: "IncidentTypes",
            keyColumn: "Id",
            keyValue: 3,
            column: "SpecialityId",
            value: 2);

        migrationBuilder.UpdateData(
            table: "IncidentTypes",
            keyColumn: "Id",
            keyValue: 4,
            column: "SpecialityId",
            value: 4);

        migrationBuilder.InsertData(
            table: "Specialities",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Mecanico", "Active" },
                { 2, "Calidad", "Active" },
                { 3, "Seguridad", "Active" },
                { 4, "General", "Active" }
            });

        migrationBuilder.CreateIndex(
            name: "IX_Users_SpecialityId",
            table: "Users",
            column: "SpecialityId");

        migrationBuilder.CreateIndex(
            name: "IX_IncidentTypes_SpecialityId",
            table: "IncidentTypes",
            column: "SpecialityId");

        migrationBuilder.AddForeignKey(
            name: "FK_IncidentTypes_Specialities_SpecialityId",
            table: "IncidentTypes",
            column: "SpecialityId",
            principalTable: "Specialities",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Specialities_SpecialityId",
            table: "Users",
            column: "SpecialityId",
            principalTable: "Specialities",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_IncidentTypes_Specialities_SpecialityId",
            table: "IncidentTypes");

        migrationBuilder.DropForeignKey(
            name: "FK_Users_Specialities_SpecialityId",
            table: "Users");

        migrationBuilder.DropTable(
            name: "Specialities");

        migrationBuilder.DropIndex(
            name: "IX_Users_SpecialityId",
            table: "Users");

        migrationBuilder.DropIndex(
            name: "IX_IncidentTypes_SpecialityId",
            table: "IncidentTypes");

        migrationBuilder.DropColumn(
            name: "SpecialityId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "SpecialityId",
            table: "IncidentTypes");
    }
}
