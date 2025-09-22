{

const tagIndex = JPGCONST.EXIF.DATETIME_ORIG;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"DateTime Original (date time taken)", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "DateTime Original (" + name + ")", bigEndian, tagIndex);

				this.IsString = true;
				this.IsDate = true;
			}
		},
});

}