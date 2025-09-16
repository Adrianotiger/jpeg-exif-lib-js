class JPGTag128 extends JpgTagSection
{
	// https://www.media.mit.edu/pia/Research/deepview/exif.html
	// Unit of XResolution(0x011a)/YResolution(0x011b). '1' means no-unit, '2' means inch, '3' means centimeter.
	constructor(buffer, offset, name, bigEndian)
	{
		super(buffer, offset, "ResolutionUnit (" + name + ")", bigEndian);
		
		this.IsUserEditable = false;
		this.TagType = "option";
		this.TagOptions = {1:"no unit", 2:"inch", 3:"cm"};
		
		this.DataOffset = this.view.getUint16(8, !bigEndian); // read again, but only 2 bytes.
		
		if(this.DataOffset > 3 || this.DataOffset < 1) console.warn("Wrong resolution unit: 1 2 or 3 are expected");		
	}

	toString()
	{
		return this.TagOptions[parseInt(this.getValue())];
	}
};