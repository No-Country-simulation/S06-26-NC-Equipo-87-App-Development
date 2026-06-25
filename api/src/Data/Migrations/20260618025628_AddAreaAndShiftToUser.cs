using Microsoft.EntityFrameworkCore.Migrations;

using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddAreaAndShiftToUser : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "AreaId",
            table: "Users",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "ShiftId",
            table: "Users",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "Shifts",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Shifts", x => x.Id));

        migrationBuilder.InsertData(
            table: "Shifts",
            columns: new[] { "Id", "Name", "Status" },
            values: new object[,]
            {
                { 1, "Turno mañana", "Active" },
                { 2, "Turno tarde", "Active" },
                { 3, "Turno nocturno", "Active" }
            });

        migrationBuilder.CreateIndex(
            name: "IX_Users_AreaId",
            table: "Users",
            column: "AreaId");

        migrationBuilder.CreateIndex(
            name: "IX_Users_ShiftId",
            table: "Users",
            column: "ShiftId");

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Areas_AreaId",
            table: "Users",
            column: "AreaId",
            principalTable: "Areas",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Shifts_ShiftId",
            table: "Users",
            column: "ShiftId",
            principalTable: "Shifts",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Users_Areas_AreaId",
            table: "Users");

        migrationBuilder.DropForeignKey(
            name: "FK_Users_Shifts_ShiftId",
            table: "Users");

        migrationBuilder.DropTable(
            name: "Shifts");

        migrationBuilder.DropIndex(
            name: "IX_Users_AreaId",
            table: "Users");

        migrationBuilder.DropIndex(
            name: "IX_Users_ShiftId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "AreaId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "ShiftId",
            table: "Users");
    }
}
