namespace Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class DateChange : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.Meteorites", "Year", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.Meteorites", "Year", c => c.DateTime(nullable: false));
        }
    }
}
