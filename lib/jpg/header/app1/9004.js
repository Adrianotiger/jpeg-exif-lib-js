{

const tagIndex = JPGCONST.EXIF.DATETIME_DIGIT;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"DateTime Digitized (date time manilupated)", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "DateTime Digitized (" + name + ")", bigEndian, tagIndex);

				this.IsString = true;
				this.IsDate = true;
			}
		},
});

}