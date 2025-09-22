
{
const tagIndex = JPGCONST.EXIF.EXIF_VERSION;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Exif VErsion", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:7, length:0, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ExifVersion (" + name + ")", bigEndian);
				
				this.IsString = true;
			}

			performChecks()
			{
				if(this.getValue().length < 3)
				{
					console.warn("Exif Version length is incorrect. Expected: 4");
				}
				else
				{
					switch(this.getValue()[1])
					{
						case '2':
							switch(this.getValue()[2])
							{
								case '2':
								case '3':
								case '4': break;
								default: console.warn("Wrong minor version of EXIF 2.x. Exptected: 2, 3 or 4"); break;
							}
							break;
						case '3':
							switch(this.getValue()[2])
							{
								case '0':
								default: console.warn("Wrong minor version of EXIF 3.x. Exptected: 0"); break;
							}
							break;
						default: console.warn("Wrong major version of EXIF. Exptected: 2 or 3"); break;
					}
				}
			}
		},
});
}