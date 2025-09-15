class JPGTag11b extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "YResolution (" + name + ")", bigEndian);
		
		this.IsUserEditable = false;
		this.TagType = "number";
	}
};