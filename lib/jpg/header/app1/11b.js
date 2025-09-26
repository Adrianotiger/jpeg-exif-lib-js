{
const tagIndex = JPGCONST.EXIF.RESOLUTION_Y;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Resolution Y / DPI", 
		exif: 2.0,
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "YResolution (" + name + ")", bigEndian, tagIndex);
				
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