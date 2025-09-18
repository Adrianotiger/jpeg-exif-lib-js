{
const tagIndex = JPGCONST.EXIF.RESOLUTION_X;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"X Resolution / DPI", 
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "XResolution (" + name + ")", bigEndian);
				
				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			toString()
			{
				return (this.getValue()[0] * this.getValue()[1])  + " dp*";
			}
		},
});
}