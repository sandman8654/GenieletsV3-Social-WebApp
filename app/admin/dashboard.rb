ActiveAdmin.register_page "Dashboard" do

  menu priority: 1, label: proc{ I18n.t("active_admin.dashboard") }

  content title: proc{ I18n.t("active_admin.dashboard") } do

    columns do
      column do
        panel "Properties Registered" do
          table_for 1 do |p|
            p.column("Total") { Property.all.count }
            p.column("Residential") { Property.where('property_type = ?', Property::PROPERTY_TYPES[0]).count }
            p.column("Commercial") { Property.where('property_type = ?', Property::PROPERTY_TYPES[1]).count }
          end
        end
      end

      column do
        panel "Subscriptions" do
          table_for 1 do |s|
            s.column("Trial") { User.where('subscription_type = ?', 'Trial').count }
            s.column("Standard") { User.where('subscription_type = ?', 'Genielets-Standard').count }
            s.column("Pro") { User.where('subscription_type = ?', 'Genielets-Pro').count }
            s.column("Enterprise") { User.where('subscription_type = ?', 'Genielets-Enterprise').count }
          end
        end
      end
    end
  end
end
