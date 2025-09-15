class JPGTag112 extends JpgTagSection
{		
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "Orientation (" + name + ")", bigEndian);
		
		this.TagType = "option";
		this.TagOptions = {1:"upper left", 3:"lower right", 6:"upper right", 8:"lower left", 9:"undefined"};
	}
};