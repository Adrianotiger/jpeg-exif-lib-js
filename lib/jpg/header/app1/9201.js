// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.SHUTTER_SPEED;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Shutter Speed", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ShutterSpeedValue (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			toString()
			{
				const apex = this.getValue()[0] / this.getValue()[1];
				const time = Math.pow(2, -apex);
				return `1/${Math.round(1 / time)}`; // e.g. "1/290"
			}
		},
});

}