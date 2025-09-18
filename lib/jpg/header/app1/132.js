{

const tagIndex = JPGCONST.EXIF.DATETIME;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"DateTime Original", 
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "DateTime (" + name + ")", bigEndian, tagIndex);

				this.IsString = true;
				this.IsDate = true;
			}
		},
});

}