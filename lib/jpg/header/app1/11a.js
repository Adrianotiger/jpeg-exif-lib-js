class JPGTag11a extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "XResolution (" + name + ")", bigEndian);
		
		this.IsUserEditable = false;
		this.TagType = "number";
	}
};