{

const tagIndex = JPGCONST.EXIF.OFFSET_TIME;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Offset time (for datetime data)", 
		exif: 2.3,
		defaults:{tag:tagIndex, type:2, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "OffsetTime (" + name + ")", bigEndian, tagIndex);

				this.IsString = true;
			}
		},
});

}