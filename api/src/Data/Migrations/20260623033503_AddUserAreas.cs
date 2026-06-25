using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Data.Migrations;

/// <inheritdoc />
public partial class AddUserAreas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Users_Areas_AreaId",
            table: "Users");

        migrationBuilder.DropIndex(
            name: "IX_Users_AreaId",
            table: "Users");

        migrationBuilder.DropColumn(
            name: "AreaId",
            table: "Users");

        migrationBuilder.CreateTable(
            name: "UserAreas",
            columns: table => new
            {
                UserId = table.Column<string>(type: "text", nullable: false),
                AreaId = table.Column<int>(type: "integer", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_UserAreas", x => new { x.UserId, x.AreaId });
                table.ForeignKey(
                    name: "FK_UserAreas_Areas_AreaId",
                    column: x => x.AreaId,
                    principalTable: "Areas",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_UserAreas_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_UserAreas_AreaId",
            table: "UserAreas",
            column: "AreaId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "UserAreas");

        migrationBuilder.AddColumn<int>(
            name: "AreaId",
            table: "Users",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Users_AreaId",
            table: "Users",
            column: "AreaId");

        migrationBuilder.AddForeignKey(
            name: "FK_Users_Areas_AreaId",
            table: "Users",
            column: "AreaId",
            principalTable: "Areas",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }
}
